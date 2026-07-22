import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from './entities/trade.entity';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';
import { Hedge } from 'src/hedges/entities/hedge.entity';
import { Book } from 'src/books/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trade, Hedge, Book])],
  controllers: [TradesController],
  providers: [TradesService],
})
export class TradesModule {}
