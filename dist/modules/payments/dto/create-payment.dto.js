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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePaymentDto {
    studentId;
    amount;
    method;
    comment;
    receiptUrl;
    addLessons;
    source;
}
exports.CreatePaymentDto = CreatePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'cash/card/transfer' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'РљРѕРјРјРµРЅС‚Р°СЂРёР№' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'РЎСЃС‹Р»РєР° РЅР° С„РѕС‚Рѕ С‡РµРєР° (РїРѕР·Р¶Рµ СЃРґРµР»Р°РµРј upload)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "receiptUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'РЎРєРѕР»СЊРєРѕ СѓСЂРѕРєРѕРІ РґРѕР±Р°РІРёС‚СЊ Рє Р±Р°Р»Р°РЅСЃСѓ РїРѕСЃР»Рµ РѕРїР»Р°С‚С‹', example: 4 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "addLessons", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Источник оплаты.',
        example: 'MOBILE_APP',
        enum: ['ADMIN_PANEL', 'MOBILE_APP'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ADMIN_PANEL', 'MOBILE_APP']),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "source", void 0);
//# sourceMappingURL=create-payment.dto.js.map