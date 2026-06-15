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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const invoices_service_1 = require("./invoices.service");
const generate_invoices_dto_1 = require("./dto/generate-invoices.dto");
let InvoicesController = class InvoicesController {
    invoices;
    constructor(invoices) {
        this.invoices = invoices;
    }
    generate(dto, req) {
        return this.invoices.generateForBranch(dto, req.user);
    }
    listStudent(studentId, period, req) {
        return this.invoices.listStudent(studentId, req.user, period);
    }
    debtors(mode, period, req) {
        const onlyNegative = mode !== 'zero';
        return this.invoices.debtors(req.user, onlyNegative, period);
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_invoices_dto_1.GenerateInvoicesDto, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, example: '2026-06' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "listStudent", null);
__decorate([
    (0, common_1.Get)('debtors'),
    (0, swagger_1.ApiQuery)({ name: 'mode', required: false, example: 'zero' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, example: '2026-06' }),
    __param(0, (0, common_1.Query)('mode')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "debtors", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('Invoices'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('invoices'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map