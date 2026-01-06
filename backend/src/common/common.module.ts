import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from './services/stock.service';
import { ForexService } from './services/forex.service';
import { SchedulerService } from './services/scheduler.service';
import { Holding } from '../holdings/entities/holding.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { AlertsModule } from '../alerts/alerts.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Holding, Alert]),
    AlertsModule,
  ],
  providers: [StockService, ForexService, SchedulerService],
  exports: [StockService, ForexService, SchedulerService],
})
export class CommonModule {}