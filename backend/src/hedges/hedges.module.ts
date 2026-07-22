import { Module } from '@nestjs/common';
import { Hedge } from './entities/hedge.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from 'src/trades/entities/trade.entity';
import { HedgesController } from './hedges.controller';
import { HedgesService } from './hedges.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hedge, Trade])],
  controllers: [HedgesController],
  providers: [HedgesService],
})
export class HedgesModule {}
