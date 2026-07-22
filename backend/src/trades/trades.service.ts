import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trade } from './entities/trade.entity';
import { Book } from '../books/entities/book.entity';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';

@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createTradeDto: CreateTradeDto): Promise<Trade> {
    const { bookId, side, currencyPair, volume, entryRate, tradeDate } =
      createTradeDto;

    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException(
        `Carteira com ID ${bookId} não foi encontrada.`,
      );
    }

    const trade = this.tradeRepository.create({
      side,
      currencyPair,
      volume,
      entryRate,
      tradeDate: tradeDate ? new Date(tradeDate) : undefined,
      book,
    });

    return this.tradeRepository.save(trade);
  }

  async findAll(): Promise<Trade[]> {
    return this.tradeRepository.find({
      relations: {
        book: true,
        hedges: true,
      },
    });
  }

  async findOne(id: string): Promise<Trade> {
    const trade = await this.tradeRepository.findOne({
      where: { id },
      relations: {
        book: true,
        hedges: true,
      },
    });

    if (!trade) {
      throw new NotFoundException(
        `Operação (Trade) com ID ${id} não foi encontrada.`,
      );
    }

    return trade;
  }

  async update(id: string, updateTradeDto: UpdateTradeDto): Promise<Trade> {
    const trade = await this.findOne(id);

    if (updateTradeDto.volume !== undefined) {
      const totalHedgesVolume = trade.hedges
        ? trade.hedges.reduce((sum, h) => sum + Number(h.volume), 0)
        : 0;

      if (updateTradeDto.volume < totalHedgesVolume) {
        throw new BadRequestException(
          `Não é possível reduzir o volume do Trade para $${updateTradeDto.volume}, pois ele já possui $${totalHedgesVolume} em Hedges atrelados.`,
        );
      }
    }

    Object.assign(trade, {
      ...updateTradeDto,
      tradeDate: updateTradeDto.tradeDate
        ? new Date(updateTradeDto.tradeDate)
        : trade.tradeDate,
    });

    return this.tradeRepository.save(trade);
  }

  async remove(id: string): Promise<void> {
    const trade = await this.findOne(id);
    await this.tradeRepository.remove(trade);
  }
}
