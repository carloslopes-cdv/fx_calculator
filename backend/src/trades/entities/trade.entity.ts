import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Book } from '../../books/entities/book.entity';
import { Hedge } from '../../hedges/entities/hedge.entity';
import { NumericColumnTransformer } from '../../database/transformers/numeric.transformer';

export type TradeSide = 'BUY' | 'SELL';

@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Book, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  @Column({ type: 'varchar', length: 4, nullable: false })
  side!: TradeSide;

  @Column({
    type: 'varchar',
    length: 6,
    name: 'currency_pair',
    nullable: false,
  })
  currencyPair!: string;

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

  @Column({ type: 'timestamp', name: 'trade_date', nullable: false })
  tradeDate!: Date;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @OneToMany(() => Hedge, 'trade')
  hedges!: Hedge[];
}
