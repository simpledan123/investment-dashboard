import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { Holding } from '../holdings/entities/holding.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Holding, Transaction])],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}