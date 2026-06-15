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
exports.KiberonsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const kiberons_service_1 = require("./kiberons.service");
let KiberonsController = class KiberonsController {
    kiberonsService;
    constructor(kiberonsService) {
        this.kiberonsService = kiberonsService;
    }
    getStudentTx(studentId, req) {
        return this.kiberonsService.getStudentKiberons(studentId, req.user);
    }
    getStudentBalance(studentId, req) {
        return this.kiberonsService.getStudentKiberonsBalance(studentId, req.user);
    }
    create(createKiberonDto, req) {
        return this.kiberonsService.create(createKiberonDto, req.user);
    }
};
exports.KiberonsController = KiberonsController;
__decorate([
    (0, common_1.Get)('student/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], KiberonsController.prototype, "getStudentTx", null);
__decorate([
    (0, common_1.Get)('student/:studentId/balance'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], KiberonsController.prototype, "getStudentBalance", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], KiberonsController.prototype, "create", null);
exports.KiberonsController = KiberonsController = __decorate([
    (0, swagger_1.ApiTags)('Kiberons'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('kiberons'),
    __metadata("design:paramtypes", [kiberons_service_1.KiberonsService])
], KiberonsController);
//# sourceMappingURL=kiberons.controller.js.map