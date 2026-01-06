import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { CommonModule } from './common/common.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HoldingsModule } from './holdings/holdings.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [
    // 환경변수 (글로벌)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'), 
    }),

    // TypeORM 설정
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // 🔍 디버깅 로그 (확인용)
        console.log('=== TypeORM Config Debug ===');
        console.log('DATABASE_HOST:', configService.get('DATABASE_HOST'));
        console.log('DATABASE_PORT:', configService.get('DATABASE_PORT'));
        console.log('DATABASE_USER:', configService.get('DATABASE_USER'));
        console.log('DATABASE_PASSWORD:', configService.get('DATABASE_PASSWORD'));
        console.log('DATABASE_NAME:', configService.get('DATABASE_NAME'));
        console.log('===========================');

        return {
          type: 'postgres',
          host: configService.get('DATABASE_HOST'),
          port: +configService.get('DATABASE_PORT'),
          username: configService.get('DATABASE_USER'),
          password: configService.get('DATABASE_PASSWORD'),
          database: configService.get('DATABASE_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: false,
        };
      },
      inject: [ConfigService],
    }),

    // 스케줄러
    ScheduleModule.forRoot(),
    
    

    // 기능 모듈들
    CommonModule,
    HoldingsModule,
    TransactionsModule,
    PortfolioModule,
    ExchangeRateModule,
    AlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}