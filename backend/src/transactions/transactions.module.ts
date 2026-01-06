import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { HoldingsModule } from '../holdings/holdings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    HoldingsModule,  // ← HoldingsService 사용
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}