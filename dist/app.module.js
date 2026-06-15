"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const students_module_1 = require("./modules/students/students.module");
const groups_module_1 = require("./modules/groups/groups.module");
const audit_module_1 = require("./modules/audit/audit.module");
const invoices_module_1 = require("./modules/invoices/invoices.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const shop_module_1 = require("./modules/shop/shop.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
const reports_module_1 = require("./modules/reports/reports.module");
const kiberons_module_1 = require("./modules/kiberons/kiberons.module");
const payments_module_1 = require("./modules/payments/payments.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const lessons_module_1 = require("./modules/lesons/lessons.module");
const education_programs_module_1 = require("./modules/education-programs/education-programs.module");
const mobile_module_1 = require("./modules/mobile/mobile.module");
const ai_module_1 = require("./modules/ai/ai.module");
const exel_reports_module_1 = require("./modules/exel_reports/exel.reports.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const finreports_module_1 = require("./modules/finance_reports/finreports.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            attendance_module_1.AttendanceModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            students_module_1.StudentsModule,
            groups_module_1.GroupsModule,
            audit_module_1.AuditModule,
            invoices_module_1.InvoicesModule,
            tasks_module_1.TasksModule,
            shop_module_1.ShopModule,
            uploads_module_1.UploadsModule,
            reports_module_1.ReportsModule,
            kiberons_module_1.KiberonsModule,
            payments_module_1.PaymentsModule,
            dashboard_module_1.DashboardModule,
            lessons_module_1.LessonsModule,
            education_programs_module_1.EducationProgramsModule,
            mobile_module_1.MobileModule,
            exel_reports_module_1.ExelReportsModule,
            ai_module_1.AiModule,
            notifications_module_1.NotificationsModule,
            finreports_module_1.FinReportsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map