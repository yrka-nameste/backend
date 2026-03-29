import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EducationProgramsController } from './education-programs.controller';
import { EducationProgramsService } from './education-programs.service';

@Module({
  imports: [PrismaModule],
  controllers: [EducationProgramsController],
  providers: [EducationProgramsService],
  exports: [EducationProgramsService],
})
export class EducationProgramsModule {}
