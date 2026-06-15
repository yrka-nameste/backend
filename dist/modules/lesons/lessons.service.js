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
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LessonsService = class LessonsService {
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
    async list(params, user) {
        const branchId = this.getBranchId(user);
        const where = {
            group: { branchId },
        };
        if (params.groupId)
            where.groupId = params.groupId;
        if (params.teacherUserId)
            where.teacherUserId = params.teacherUserId;
        if (params.from || params.to) {
            where.startsAt = {};
            if (params.from)
                where.startsAt.gte = new Date(params.from);
            if (params.to)
                where.startsAt.lte = new Date(params.to);
        }
        return this.prisma.lesson.findMany({
            where,
            include: {
                group: true,
                teacher: {
                    select: { id: true, fullName: true, email: true, phone: true, role: true },
                },
            },
            orderBy: { startsAt: 'asc' },
        });
    }
    async getOne(id, user) {
        const branchId = this.getBranchId(user);
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: {
                group: true,
                teacher: {
                    select: { id: true, fullName: true, email: true, phone: true, role: true },
                },
                attendances: {
                    include: {
                        student: true,
                    },
                },
            },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (lesson.group.branchId !== branchId) {
            throw new common_1.BadRequestException('Lesson belongs to another branch');
        }
        return lesson;
    }
    async create(dto, user) {
        const branchId = this.getBranchId(user);
        const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
        if (!group)
            throw new common_1.BadRequestException('groupId not found');
        if (group.branchId !== branchId) {
            throw new common_1.BadRequestException('group belongs to another branch');
        }
        if (dto.teacherUserId) {
            const teacher = await this.prisma.user.findUnique({ where: { id: dto.teacherUserId } });
            if (!teacher)
                throw new common_1.BadRequestException('teacherUserId not found');
            if (teacher.branchId !== branchId) {
                throw new common_1.BadRequestException('teacher belongs to another branch');
            }
        }
        return this.prisma.lesson.create({
            data: {
                groupId: dto.groupId,
                startsAt: new Date(dto.startsAt),
                endsAt: new Date(dto.endsAt),
                topic: dto.topic ?? null,
                location: dto.location ?? null,
                teacherUserId: dto.teacherUserId ?? null,
                isChargeable: dto.isChargeable ?? true,
                lessonNote: dto.lessonNote ?? null,
                homework: dto.homework ?? null,
            },
            include: {
                group: true,
                teacher: {
                    select: { id: true, fullName: true, email: true, phone: true, role: true },
                },
            },
        });
    }
    async update(id, dto, user) {
        const branchId = this.getBranchId(user);
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: { group: true },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (lesson.group.branchId !== branchId) {
            throw new common_1.BadRequestException('Lesson belongs to another branch');
        }
        if (dto.teacherUserId) {
            const teacher = await this.prisma.user.findUnique({ where: { id: dto.teacherUserId } });
            if (!teacher)
                throw new common_1.BadRequestException('teacherUserId not found');
            if (teacher.branchId !== branchId) {
                throw new common_1.BadRequestException('teacher belongs to another branch');
            }
        }
        return this.prisma.lesson.update({
            where: { id },
            data: {
                ...(dto.startsAt !== undefined ? { startsAt: new Date(dto.startsAt) } : {}),
                ...(dto.endsAt !== undefined ? { endsAt: new Date(dto.endsAt) } : {}),
                ...(dto.topic !== undefined ? { topic: dto.topic } : {}),
                ...(dto.location !== undefined ? { location: dto.location } : {}),
                ...(dto.teacherUserId !== undefined ? { teacherUserId: dto.teacherUserId || null } : {}),
                ...(dto.isChargeable !== undefined ? { isChargeable: dto.isChargeable } : {}),
                ...(dto.status !== undefined ? { status: dto.status } : {}),
                ...(dto.lessonNote !== undefined ? { lessonNote: dto.lessonNote } : {}),
                ...(dto.homework !== undefined ? { homework: dto.homework } : {}),
            },
            include: {
                group: true,
                teacher: {
                    select: { id: true, fullName: true, email: true, phone: true, role: true },
                },
            },
        });
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LessonsService);
//# sourceMappingURL=lessons.service.js.map