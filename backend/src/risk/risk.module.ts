import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/books/entities/book.entity';
import { RiskController } from './risk..controller';
import { RiskService } from './risk.service';
import { MarketDataService } from 'src/market-data/market-data.service';
import { Trade } from 'src/trades/entities/trade.entity';
import { Hedge } from 'src/hedges/entities/hedge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Trade, Hedge])],
  controllers: [RiskController],
  providers: [RiskService, MarketDataService],
})
export class RiskModule {}
