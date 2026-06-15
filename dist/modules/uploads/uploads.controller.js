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
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const s3_service_1 = require("./s3.service");
let UploadsController = class UploadsController {
    s3;
    constructor(s3) {
        this.s3 = s3;
    }
    async uploadReceipt(file) {
        if (!file)
            throw new common_1.BadRequestException('file is required');
        if (!file.mimetype?.startsWith('image/')) {
            throw new common_1.BadRequestException('Only image files are allowed');
        }
        return this.s3.uploadBuffer({
            buffer: file.buffer,
            contentType: file.mimetype,
            originalName: file.originalname,
            folder: 'receipts',
        });
    }
    async uploadShopItemImage(file) {
        if (!file)
            throw new common_1.BadRequestException('file is required');
        if (!file.mimetype?.startsWith('image/')) {
            throw new common_1.BadRequestException('Only image files are allowed');
        }
        return this.s3.uploadBuffer({
            buffer: file.buffer,
            contentType: file.mimetype,
            originalName: file.originalname,
            folder: 'shop-items',
        });
    }
    async view(key) {
        if (!key?.trim())
            throw new common_1.BadRequestException('key is required');
        return this.s3.getPresignedUrl(key, { inline: true });
    }
    async download(key) {
        if (!key?.trim())
            throw new common_1.BadRequestException('key is required');
        return this.s3.getPresignedUrl(key, { inline: false });
    }
    async redirect(key, res) {
        if (!key?.trim())
            throw new common_1.BadRequestException('key is required');
        const { url } = await this.s3.getPresignedUrl(key, { inline: true });
        return res.redirect(url);
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('receipt'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
            required: ['file'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadReceipt", null);
__decorate([
    (0, common_1.Post)('shop-item'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
            required: ['file'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadShopItemImage", null);
__decorate([
    (0, common_1.Get)('view'),
    __param(0, (0, common_1.Query)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "view", null);
__decorate([
    (0, common_1.Get)('download'),
    __param(0, (0, common_1.Query)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "download", null);
__decorate([
    (0, common_1.Get)('redirect'),
    __param(0, (0, common_1.Query)('key')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "redirect", null);
exports.UploadsController = UploadsController = __decorate([
    (0, swagger_1.ApiTags)('Uploads'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('uploads'),
    __metadata("design:paramtypes", [s3_service_1.S3Service])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map