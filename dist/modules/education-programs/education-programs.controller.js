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
exports.EducationProgramsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const education_programs_service_1 = require("./education-programs.service");
const create_education_program_dto_1 = require("./dto/create-education-program.dto");
const update_education_program_dto_1 = require("./dto/update-education-program.dto");
let EducationProgramsController = class EducationProgramsController {
    programs;
    constructor(programs) {
        this.programs = programs;
    }
    list(req) {
        return this.programs.list(req.user);
    }
    getOne(id, req) {
        return this.programs.getOne(id, req.user);
    }
    create(dto, req) {
        return this.programs.create(dto, req.user);
    }
    update(id, dto, req) {
        return this.programs.update(id, dto, req.user);
    }
};
exports.EducationProgramsController = EducationProgramsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EducationProgramsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EducationProgramsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_education_program_dto_1.CreateEducationProgramDto, Object]),
    __metadata("design:returntype", void 0)
], EducationProgramsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_education_program_dto_1.UpdateEducationProgramDto, Object]),
    __metadata("design:returntype", void 0)
], EducationProgramsController.prototype, "update", null);
exports.EducationProgramsController = EducationProgramsController = __decorate([
    (0, swagger_1.ApiTags)('Education Programs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('education-programs'),
    __metadata("design:paramtypes", [education_programs_service_1.EducationProgramsService])
], EducationProgramsController);
//# sourceMappingURL=education-programs.controller.js.map