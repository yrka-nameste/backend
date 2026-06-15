"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationProgramsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const education_programs_controller_1 = require("./education-programs.controller");
const education_programs_service_1 = require("./education-programs.service");
let EducationProgramsModule = class EducationProgramsModule {
};
exports.EducationProgramsModule = EducationProgramsModule;
exports.EducationProgramsModule = EducationProgramsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [education_programs_controller_1.EducationProgramsController],
        providers: [education_programs_service_1.EducationProgramsService],
        exports: [education_programs_service_1.EducationProgramsService],
    })
], EducationProgramsModule);
//# sourceMappingURL=education-programs.module.js.map