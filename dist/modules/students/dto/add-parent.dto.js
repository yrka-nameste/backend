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
exports.AddParentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AddParentDto {
    fullName;
    phone;
    email;
    relationType;
    password;
}
exports.AddParentDto = AddParentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'РРІР°РЅРѕРІР° РњР°СЂРёСЏ РЎРµСЂРіРµРµРІРЅР°' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddParentDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+37377798654' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddParentDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'mom@example.com', description: 'Р•СЃР»Рё РЅРµ РїРµСЂРµРґР°Р»Рё вЂ” Р»РѕРіРёРЅ Р±СѓРґРµС‚ p<digits>@parent.local' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddParentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'MOTHER' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddParentDto.prototype, "relationType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'P@ssw0rd123', description: 'Р•СЃР»Рё РЅРµ РїРµСЂРµРґР°Р»Рё вЂ” СЃРіРµРЅРµСЂРёСЂСѓРµРј Рё РІРµСЂРЅС‘Рј РѕРґРёРЅ СЂР°Р·' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddParentDto.prototype, "password", void 0);
//# sourceMappingURL=add-parent.dto.js.map