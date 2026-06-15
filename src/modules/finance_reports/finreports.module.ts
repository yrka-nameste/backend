import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FinReportsController } from './finreports.controller';
import { FinReportsService } from './finreports.service';

@Module({
  imports: [PrismaModule],
  controllers: [FinReportsController],
  providers: [FinReportsService],
})
export class FinReportsModule {}