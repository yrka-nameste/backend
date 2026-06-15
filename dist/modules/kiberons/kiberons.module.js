"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KiberonsModule = void 0;
const common_1 = require("@nestjs/common");
const kiberons_controller_1 = require("./kiberons.controller");
const kiberons_service_1 = require("./kiberons.service");
let KiberonsModule = class KiberonsModule {
};
exports.KiberonsModule = KiberonsModule;
exports.KiberonsModule = KiberonsModule = __decorate([
    (0, common_1.Module)({
        controllers: [kiberons_controller_1.KiberonsController],
        providers: [kiberons_service_1.KiberonsService],
    })
], KiberonsModule);
//# sourceMappingURL=kiberons.module.js.map