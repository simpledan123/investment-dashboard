import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('holdings')
export class Holding {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, unique: true })
  ticker: string;

  @Column({ length: 100, nullable: true })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.holding, {
    cascade: true,
  })
  transactions: Transaction[];
}