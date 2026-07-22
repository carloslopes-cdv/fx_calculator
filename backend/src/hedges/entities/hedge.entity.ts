import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Trade } from '../../trades/entities/trade.entity';

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

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: false })
  volume!: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 6,
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
