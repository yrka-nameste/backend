"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinReportsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const finreports_controller_1 = require("./finreports.controller");
const finreports_service_1 = require("./finreports.service");
let FinReportsModule = class FinReportsModule {
};
exports.FinReportsModule = FinReportsModule;
exports.FinReportsModule = FinReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [finreports_controller_1.FinReportsController],
        providers: [finreports_service_1.FinReportsService],
    })
], FinReportsModule);
//# sourceMappingURL=finreports.module.js.map