import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { RiskHealthStatus } from './enums/risk-status.enum';
import {
  RiskReportResponseDto,
  TradeRiskDetailDto,
  RiskSuggestedActionDto,
} from './dto/risk-response.dto';
import { MarketDataService } from 'src/market-data/market-data.service';

@Injectable()
export class RiskService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly marketDataService: MarketDataService,
  ) {}

  async getBookRiskReport(
    bookId: string,
    customRates?: Record<string, number>,
  ): Promise<RiskReportResponseDto> {
    const book = await this.bookRepository.findOne({
      where: { id: bookId },
      relations: {
        trades: {
          hedges: true,
        },
      },
    });

    if (!book) {
      throw new NotFoundException(
        `Carteira com ID ${bookId} não foi encontrada.`,
      );
    }

    const liveRates = await this.marketDataService.getLiveSpotRates();

    let totalExposedVolume = 0;
    let totalHedgedVolume = 0;
    let totalUnrealizedPnl = 0;

    const tradesDetails: TradeRiskDetailDto[] = [];

    for (const trade of book.trades) {
      const volume = Number(trade.volume);
      const entryRate = Number(trade.entryRate);

      const hedgedVolume = trade.hedges
        ? trade.hedges.reduce((sum, h) => sum + Number(h.volume), 0)
        : 0;

      const unhedgedVolume = volume - hedgedVolume;
      const hedgeRatioPercent = volume > 0 ? (hedgedVolume / volume) * 100 : 0;

      // 2. Resolve a taxa: prioriza a customizada (query param); se não houver, usa a do liveRates; fallback 5.25
      const fallbackRate = trade.currencyPair === 'EURBRL' ? 6.15 : 5.65;
      const marketRate: number =
        customRates && customRates[trade.currencyPair] !== undefined
          ? Number(customRates[trade.currencyPair])
          : Number(liveRates[trade.currencyPair] ?? fallbackRate);

      // Cálculo de PnL com lógica direcional (BUY / SELL)
      const rateDiff = marketRate - entryRate;
      const unrealizedPnl =
        trade.side === 'BUY'
          ? unhedgedVolume * rateDiff
          : unhedgedVolume * -rateDiff;

      totalExposedVolume += volume;
      totalHedgedVolume += hedgedVolume;
      totalUnrealizedPnl += unrealizedPnl;

      tradesDetails.push({
        tradeId: trade.id,
        side: trade.side,
        currencyPair: trade.currencyPair,
        volume,
        hedgedVolume,
        unhedgedVolume,
        hedgeRatioPercent: Number(hedgeRatioPercent.toFixed(2)),
        entryRate,
        marketRate,
        unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
      });
    }

    const overallHedgeRatioPercent =
      totalExposedVolume > 0
        ? (totalHedgedVolume / totalExposedVolume) * 100
        : 0;

    // 📐 CÁLCULO DA EXPOSIÇÃO LÍQUIDA AQUI
    const totalNetExposure = Math.max(
      0,
      totalExposedVolume - totalHedgedVolume,
    );

    // Regra do Semáforo de Risco (80% Target)
    let healthStatus: RiskHealthStatus = RiskHealthStatus.Healthy;
    let suggestedAction: RiskSuggestedActionDto | undefined = undefined;

    if (overallHedgeRatioPercent < 80) {
      const targetHedged = totalExposedVolume * 0.8;
      const neededHedge = targetHedged - totalHedgedVolume;

      healthStatus =
        overallHedgeRatioPercent < 50
          ? RiskHealthStatus.Critical
          : RiskHealthStatus.Warning;

      suggestedAction = {
        action: 'BUY',
        targetCurrency: 'USD',
        amount: Number(neededHedge.toFixed(2)),
      };
    }

    return {
      bookId: book.id,
      bookName: book.name,
      totalExposedVolume: Number(totalExposedVolume.toFixed(2)),
      totalHedgedVolume: Number(totalHedgedVolume.toFixed(2)),
      netExposure: Number(totalNetExposure.toFixed(2)), // <-- INJETADO NO RETORNO
      overallHedgeRatioPercent: Number(overallHedgeRatioPercent.toFixed(2)),
      healthStatus,
      suggestedAction,
      totalUnrealizedPnl: Number(totalUnrealizedPnl.toFixed(2)),
      tradesDetails,
    };
  }
}
