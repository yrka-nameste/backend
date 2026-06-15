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
exports.ShopController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const shop_service_1 = require("./shop.service");
const create_item_dto_1 = require("./dto/create-item.dto");
const create_order_dto_1 = require("./dto/create-order.dto");
let ShopController = class ShopController {
    shop;
    constructor(shop) {
        this.shop = shop;
    }
    listItems(visible, req) {
        return this.shop.listItems(visible, req.user);
    }
    createItem(dto, req) {
        return this.shop.createItem(dto, req.user);
    }
    updateItem(id, dto, req) {
        return this.shop.updateItem(id, dto, req.user);
    }
    listOrders(status, req) {
        return this.shop.listOrders(status, req.user);
    }
    createOrder(dto, req) {
        return this.shop.createOrder(dto, req.user);
    }
    approve(id, req) {
        return this.shop.approve(id, req.user);
    }
    reject(id, req) {
        return this.shop.reject(id, req.user);
    }
};
exports.ShopController = ShopController;
__decorate([
    (0, common_1.Get)('items'),
    __param(0, (0, common_1.Query)('visible')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "listItems", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_item_dto_1.CreateShopItemDto, Object]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "createItem", null);
__decorate([
    (0, common_1.Patch)('items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_item_dto_1.CreateShopItemDto, Object]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "listOrders", null);
__decorate([
    (0, common_1.Post)('orders'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateShopOrderDto, Object]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('orders/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('orders/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "reject", null);
exports.ShopController = ShopController = __decorate([
    (0, swagger_1.ApiTags)('Shop'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('shop'),
    __metadata("design:paramtypes", [shop_service_1.ShopService])
], ShopController);
//# sourceMappingURL=shop.controller.js.map