import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

export interface BookSummary {
  id: string;
  name: string;
  totalVolume: number;
  hedgedVolume: number;
  netExposure: number;
  unrealizedPnL: number;
  createdAt?: string | Date;
}

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create(createBookDto);
    return this.bookRepository.save(book);
  }

  async findAll(): Promise<BookSummary[]> {
    const books = await this.bookRepository.find({
      relations: { trades: { hedges: true } },
    });

    return books.map((book): BookSummary => {
      let totalVolume = 0;
      let hedgedVolume = 0;
      let unrealizedPnL = 0;

      if (book.trades) {
        book.trades.forEach((trade) => {
          totalVolume += Number(trade.volume || 0);

          if ('unrealizedPnL' in trade) {
            unrealizedPnL += Number(
              (trade as unknown as { unrealizedPnL: number }).unrealizedPnL ||
                0,
            );
          }

          if (trade.hedges) {
            trade.hedges.forEach((hedge) => {
              hedgedVolume += Number(hedge.volume || 0);
            });
          }
        });
      }

      const netExposure = Math.max(0, totalVolume - hedgedVolume);

      return {
        id: book.id,
        name: book.name,
        totalVolume,
        hedgedVolume,
        netExposure,
        unrealizedPnL,
        createdAt: book.createdAt,
      };
    });
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: { trades: { hedges: true } },
    });

    if (!book) {
      throw new NotFoundException(`Carteria com ID ${id} mão encontrada.`);
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    Object.assign(book, updateBookDto);
    return this.bookRepository.save(book);
  }

  async remove(id: string): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
  }
}
