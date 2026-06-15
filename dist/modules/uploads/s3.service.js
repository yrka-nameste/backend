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
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let S3Service = class S3Service {
    bucket;
    client;
    constructor() {
        const endpoint = (process.env.S3_ENDPOINT ?? '').trim();
        const region = (process.env.S3_REGION ?? '').trim();
        const bucket = (process.env.S3_BUCKET ?? '').trim();
        const accessKeyId = (process.env.S3_ACCESS_KEY_ID ?? '').trim();
        const secretAccessKey = (process.env.S3_SECRET_ACCESS_KEY ?? '').trim();
        if (!endpoint)
            throw new Error('S3_ENDPOINT is required');
        if (!region)
            throw new Error('S3_REGION is required');
        if (!bucket)
            throw new Error('S3_BUCKET is required');
        if (!accessKeyId)
            throw new Error('S3_ACCESS_KEY_ID is required');
        if (!secretAccessKey)
            throw new Error('S3_SECRET_ACCESS_KEY is required');
        this.bucket = bucket;
        this.client = new client_s3_1.S3Client({
            region,
            endpoint,
            credentials: { accessKeyId, secretAccessKey },
            forcePathStyle: true,
        });
    }
    getExt(originalName, contentType) {
        const byName = originalName ? originalName.split('.').pop()?.toLowerCase() : undefined;
        if (byName && byName.length <= 6)
            return byName;
        const map = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'application/pdf': 'pdf',
        };
        return map[contentType ?? ''] ?? 'bin';
    }
    async uploadBuffer(args) {
        const { buffer, contentType, originalName, folder } = args;
        if (!buffer?.length)
            throw new common_1.BadRequestException('file buffer is required');
        if (!folder?.trim())
            throw new common_1.BadRequestException('folder is required');
        const ext = this.getExt(originalName, contentType);
        const date = new Date().toISOString().slice(0, 10);
        const key = folder + '/' + date + '/' + (0, crypto_1.randomUUID)() + '.' + ext;
        await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }));
        return { key };
    }
    async getPresignedUrl(key, opts) {
        if (!key?.trim())
            throw new common_1.BadRequestException('key is required');
        try {
            await this.client.send(new client_s3_1.HeadObjectCommand({ Bucket: this.bucket, Key: key }));
        }
        catch {
            throw new common_1.BadRequestException('Key not found: ' + key);
        }
        const expiresSec = opts?.expiresSec ?? 600;
        const inline = opts?.inline ?? true;
        const cmd = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ResponseContentDisposition: inline ? 'inline' : 'attachment',
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, cmd, { expiresIn: expiresSec });
        return { key, url, expiresSec };
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], S3Service);
//# sourceMappingURL=s3.service.js.map