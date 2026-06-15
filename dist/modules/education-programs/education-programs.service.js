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
exports.EducationProgramsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let EducationProgramsService = class EducationProgramsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getBranchId(user) {
        const branchId = user?.branchId;
        if (!branchId)
            throw new common_1.BadRequestException('User has no branchId');
        return branchId;
    }
    async list(user) {
        const branchId = this.getBranchId(user);
        return this.prisma.educationProgram.findMany({
            where: { branchId },
            include: { group: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOne(id, user) {
        const branchId = this.getBranchId(user);
        const item = await this.prisma.educationProgram.findUnique({
            where: { id },
            include: { group: true },
        });
        if (!item)
            throw new common_1.NotFoundException('EducationProgram not found');
        if (item.branchId !== branchId) {
            throw new common_1.BadRequestException('EducationProgram belongs to another branch');
        }
        return item;
    }
    async create(dto, user) {
        const branchId = this.getBranchId(user);
        if (dto.groupId) {
            const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
            if (!group)
                throw new common_1.BadRequestException('groupId not found');
            if (group.branchId !== branchId) {
                throw new common_1.BadRequestException('group belongs to another branch');
            }
        }
        return this.prisma.educationProgram.create({
            data: {
                branchId,
                name: dto.name,
                description: dto.description ?? null,
                groupId: dto.groupId ?? null,
                lessonsCount: dto.lessonsCount ?? 0,
                isActive: dto.isActive ?? true,
            },
            include: { group: true },
        });
    }
    async update(id, dto, user) {
        const branchId = this.getBranchId(user);
        const item = await this.prisma.educationProgram.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('EducationProgram not found');
        if (item.branchId !== branchId) {
            throw new common_1.BadRequestException('EducationProgram belongs to another branch');
        }
        if (dto.groupId) {
            const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
            if (!group)
                throw new common_1.BadRequestException('groupId not found');
            if (group.branchId !== branchId) {
                throw new common_1.BadRequestException('group belongs to another branch');
            }
        }
        return this.prisma.educationProgram.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.groupId !== undefined ? { groupId: dto.groupId || null } : {}),
                ...(dto.lessonsCount !== undefined ? { lessonsCount: dto.lessonsCount } : {}),
                ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
            },
            include: { group: true },
        });
    }
};
exports.EducationProgramsService = EducationProgramsService;
exports.EducationProgramsService = EducationProgramsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EducationProgramsService);
//# sourceMappingURL=education-programs.service.js.map