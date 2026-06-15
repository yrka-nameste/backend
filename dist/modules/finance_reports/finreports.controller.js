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
exports.FinReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const finreports_service_1 = require("./finreports.service");
let FinReportsController = class FinReportsController {
    finReports;
    constructor(finReports) {
        this.finReports = finReports;
    }
    summary(period, req) {
        return this.finReports.getFinanceSummary(req.user, period);
    }
    payments(period, method, source, q, req) {
        return this.finReports.getFinancePayments(req.user, {
            period,
            method,
            source,
            q,
        });
    }
    async excel(period, req, res) {
        const result = await this.finReports.generateFinanceExcel(req.user, period);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.buffer);
    }
};
exports.FinReportsController = FinReportsController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, example: '2026-06' }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinReportsController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, example: '2026-06' }),
    (0, swagger_1.ApiQuery)({ name: 'method', required: false, example: 'transfer' }),
    (0, swagger_1.ApiQuery)({ name: 'source', required: false, example: 'MOBILE_APP' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, example: 'Иванов' }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('method')),
    __param(2, (0, common_1.Query)('source')),
    __param(3, (0, common_1.Query)('q')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], FinReportsController.prototype, "payments", null);
__decorate([
    (0, common_1.Get)('excel'),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, example: '2026-06' }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FinReportsController.prototype, "excel", null);
exports.FinReportsController = FinReportsController = __decorate([
    (0, swagger_1.ApiTags)('Finance Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('finance-reports'),
    __metadata("design:paramtypes", [finreports_service_1.FinReportsService])
], FinReportsController);
//# sourceMappingURL=finreports.controller.js.map