import { Module } from '@nestjs/common';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { GroupsModule } from './modules/groups/groups.module';
import { AuditModule } from './modules/audit/audit.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ShopModule } from './modules/shop/shop.module';
import {UploadsModule} from "./modules/uploads/uploads.module";
import { ReportsModule } from './modules/reports/reports.module'; 
import { KiberonsModule } from './modules/kiberons/kiberons.module';
import {PaymentsModule } from './modules/payments/payments.module';
import {DashboardModule } from './modules/dashboard/dashboard.module';
import { LessonsModule } from './modules/lesons/lessons.module';
import { EducationProgramsModule} from './modules/education-programs/education-programs.module';
import { MobileModule } from './modules/mobile/mobile.module';
import { AiModule } from './modules/ai/ai.module';
@Module({
  imports: [
    AttendanceModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    GroupsModule,
    AuditModule,
    InvoicesModule,
    TasksModule,
    ShopModule,
    UploadsModule,
    ReportsModule,
    KiberonsModule,
    PaymentsModule,
    DashboardModule,
    LessonsModule,
    EducationProgramsModule,
    MobileModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


