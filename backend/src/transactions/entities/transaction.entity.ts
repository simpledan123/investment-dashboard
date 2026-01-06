import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Holding } from '../../holdings/entities/holding.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  ticker: string;

  @Column({ length: 4 })
  type: 'BUY' | 'SELL';

  @Column('decimal', { precision: 10, scale: 4 })
  shares: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'price_usd' })
  priceUsd: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'timestamp', name: 'transaction_time' })
  transactionTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Holding, (holding) => holding.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticker', referencedColumnName: 'ticker' })
  holding: Holding;
}