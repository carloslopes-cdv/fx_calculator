import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hedge } from './entities/hedge.entity';
import { Trade } from '../trades/entities/trade.entity';
import { CreateHedgeDto } from './dto/create-hedge.dto';
import { UpdateHedgeDto } from './dto/update-hedge.dto';

@Injectable()
export class HedgesService {
  constructor(
    @InjectRepository(Hedge)
    private readonly hedgeRepository: Repository<Hedge>,
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
  ) {}

  async create(createHedgeDto: CreateHedgeDto): Promise<Hedge> {
    const { tradeId, ...hedgeData } = createHedgeDto;

    const trade = await this.tradeRepository.findOne({
      where: { id: tradeId },
      relations: { hedges: true },
    });

    if (!trade) {
      throw new NotFoundException(
        `Operação (Trade) com ID ${tradeId} não foi encontrada.`,
      );
    }

    const currentHedgeVolume = trade.hedges
      ? trade.hedges.reduce((sum, h) => sum + Number(h.volume), 0)
      : 0;

    const newTotalVolume = currentHedgeVolume + hedgeData.volume;

    if (newTotalVolume > Number(trade.volume)) {
      throw new BadRequestException(
        `Violação de Anti-Overhedging: O volume total protegido ($${newTotalVolume}) excederia o volume do Trade ($${trade.volume}).`,
      );
    }

    const hedge = this.hedgeRepository.create({
      ...hedgeData,
      trade,
    });

    return await this.hedgeRepository.save(hedge);
  }

  async findAll(): Promise<Hedge[]> {
    return await this.hedgeRepository.find({
      relations: { trade: true },
    });
  }

  async findOne(id: string): Promise<Hedge> {
    const hedge = await this.hedgeRepository.findOne({
      where: { id },
      relations: { trade: { hedges: true } },
    });

    if (!hedge) {
      throw new NotFoundException(
        `Proteção (Hedge) com ID ${id} não foi encontrada.`,
      );
    }

    return hedge;
  }

  async update(id: string, updateHedgeDto: UpdateHedgeDto): Promise<Hedge> {
    const hedge = await this.findOne(id);

    if (updateHedgeDto.volume !== undefined && hedge.trade) {
      const otherHedgesVolume = hedge.trade.hedges
        ? hedge.trade.hedges
            .filter((h) => h.id !== id)
            .reduce((sum, h) => sum + Number(h.volume), 0)
        : 0;

      const proposedTotalVolume = otherHedgesVolume + updateHedgeDto.volume;

      if (proposedTotalVolume > Number(hedge.trade.volume)) {
        throw new BadRequestException(
          `Violação de Anti-Overhedging: A alteração para $${updateHedgeDto.volume} faria o total protegido ($${proposedTotalVolume}) exceder o Trade ($${hedge.trade.volume}).`,
        );
      }
    }

    Object.assign(hedge, {
      ...updateHedgeDto,
      hedgeDate: updateHedgeDto.hedgeDate
        ? new Date(updateHedgeDto.hedgeDate)
        : hedge.hedgeDate,
    });

    return await this.hedgeRepository.save(hedge);
  }

  async remove(id: string): Promise<void> {
    const hedge = await this.findOne(id);
    await this.hedgeRepository.remove(hedge);
  }
}
