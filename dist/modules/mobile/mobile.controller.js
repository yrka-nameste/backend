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
exports.MobileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const mobile_service_1 = require("./mobile.service");
let MobileController = class MobileController {
    mobile;
    constructor(mobile) {
        this.mobile = mobile;
    }
    parentHome(studentId, req) {
        return this.mobile.parentHome(studentId, req.user);
    }
    parentKiberons(studentId, req) {
        return this.mobile.parentKiberons(studentId, req.user);
    }
    parentShop(studentId, req) {
        return this.mobile.parentShop(studentId, req.user);
    }
    parentPayments(studentId, req) {
        return this.mobile.parentPayments(studentId, req.user);
    }
    teacherHome(req) {
        return this.mobile.teacherHome(req.user);
    }
    teacherLessonsToday(req) {
        return this.mobile.teacherLessonsToday(req.user);
    }
    teacherGroups(req) {
        return this.mobile.teacherGroups(req.user);
    }
    teacherGroup(groupId, req) {
        return this.mobile.teacherGroup(groupId, req.user);
    }
    birthdays(req) {
        return this.mobile.birthdays(req.user);
    }
    absentThisWeek(req) {
        return this.mobile.absentThisWeek(req.user);
    }
};
exports.MobileController = MobileController;
__decorate([
    (0, common_1.Get)('parent/home'),
    __param(0, (0, common_1.Query)('studentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "parentHome", null);
__decorate([
    (0, common_1.Get)('parent/kiberons'),
    __param(0, (0, common_1.Query)('studentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "parentKiberons", null);
__decorate([
    (0, common_1.Get)('parent/shop'),
    __param(0, (0, common_1.Query)('studentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "parentShop", null);
__decorate([
    (0, common_1.Get)('parent/payments'),
    __param(0, (0, common_1.Query)('studentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "parentPayments", null);
__decorate([
    (0, common_1.Get)('teacher/home'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "teacherHome", null);
__decorate([
    (0, common_1.Get)('teacher/lessons/today'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "teacherLessonsToday", null);
__decorate([
    (0, common_1.Get)('teacher/groups'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "teacherGroups", null);
__decorate([
    (0, common_1.Get)('teacher/group/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "teacherGroup", null);
__decorate([
    (0, common_1.Get)('crm/birthdays'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "birthdays", null);
__decorate([
    (0, common_1.Get)('crm/absent-this-week'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "absentThisWeek", null);
exports.MobileController = MobileController = __decorate([
    (0, swagger_1.ApiTags)('Mobile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('mobile'),
    __metadata("design:paramtypes", [mobile_service_1.MobileService])
], MobileController);
//# sourceMappingURL=mobile.controller.js.map