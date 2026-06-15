import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ExelReportsController } from './exel.reports.controller';
import { ExelReportsService } from './exel.reports.service';

@Module({
  imports: [PrismaModule],
  controllers: [ExelReportsController],
  providers: [ExelReportsService],
  exports: [ExelReportsService],
})
export class ExelReportsModule {}

