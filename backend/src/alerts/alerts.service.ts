import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { AlertResponseDto, AlertListResponseDto } from './dto/alert-response.dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertsRepository: Repository<Alert>,
  ) {}

  async create(ticker: string, changePercent: number, price: number): Promise<Alert> {
    const alert = this.alertsRepository.create({
      ticker: ticker.toUpperCase(),
      changePercent,
      price,
    });

    return await this.alertsRepository.save(alert);
  }

  async findAll(ticker?: string, limit: number = 10): Promise<AlertListResponseDto> {
    const query = this.alertsRepository.createQueryBuilder('alert');

    if (ticker) {
      query.where('alert.ticker = :ticker', { ticker: ticker.toUpperCase() });
    }

    const [alerts, totalCount] = await query
      .orderBy('alert.sentAt', 'DESC')
      .take(limit)
      .getManyAndCount();

    return {
      alerts: alerts.map(a => ({
        id: a.id,
        ticker: a.ticker,
        changePercent: Number(a.changePercent),
        price: Number(a.price),
        sentAt: a.sentAt,
      })),
      totalCount,
    };
  }

  async findOne(id: number): Promise<Alert> {
    const alert = await this.alertsRepository.findOne({ where: { id } });
    
    if (!alert) {
      throw new NotFoundException(`Alert with id ${id} not found`);
    }
    
    return alert;
  }

  async deleteOldAlerts(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.alertsRepository.delete({
      sentAt: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }

  update(id: number, updateAlertDto: any) {
    return `This action updates a #${id} alert`;
  }

  remove(id: number) {
    return `This action removes a #${id} alert`;
  }
}