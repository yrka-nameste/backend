"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExelReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const exel_reports_service_1 = require("./exel.reports.service");
let ExelReportsController = class ExelReportsController {
    reports;
    constructor(reports) {
        this.reports = reports;
    }
    async attendanceExcel(groupId, from, to, req, res) {
        const file = await this.reports.buildAttendanceExcel({ groupId, from, to }, req.user);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.xlsx');
        res.send(file);
    }
    async lessonsExcel(groupId, teacherUserId, from, to, req, res) {
        const file = await this.reports.buildLessonsExcel({ groupId, teacherUserId, from, to }, req.user);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=lessons-report.xlsx');
        res.send(file);
    }
};
exports.ExelReportsController = ExelReportsController;
__decorate([
    (0, common_1.Get)('attendance-excel'),
    __param(0, (0, common_1.Query)('groupId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExelReportsController.prototype, "attendanceExcel", null);
__decorate([
    (0, common_1.Get)('lessons-excel'),
    __param(0, (0, common_1.Query)('groupId')),
    __param(1, (0, common_1.Query)('teacherUserId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __param(4, (0, common_1.Req)()),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExelReportsController.prototype, "lessonsExcel", null);
exports.ExelReportsController = ExelReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [exel_reports_service_1.ExelReportsService])
], ExelReportsController);
//# sourceMappingURL=exel.reports.controller.js.map