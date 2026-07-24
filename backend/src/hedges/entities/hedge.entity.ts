import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Trade } from '../../trades/entities/trade.entity';
import { NumericColumnTransformer } from '../../database/transformers/numeric.transformer';

@Entity('hedges')
export class Hedge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Trade, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trade_id' })
  trade!: Trade;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 4,
    transformer: new NumericColumnTransformer(),
    nullable: false,
  })
  volume!: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 4,
    transformer: new NumericColumnTransformer(),
    name: 'entry_rate',
    nullable: false,
  })
  entryRate!: number;

  @Column({ type: 'timestamp', name: 'hedge_date', nullable: false })
  hedgeDate!: Date;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
