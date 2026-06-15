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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
function startOfDayUTC(d) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}
function addDaysUTC(d, days) {
    return new Date(d.getTime() + days * 86400000);
}
let TasksService = class TasksService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    getBranchId(user) {
        const branchId = user?.branchId;
        if (!branchId)
            throw new common_1.BadRequestException('User has no branchId');
        return branchId;
    }
    getUserId(user) {
        return (user?.userId ?? user?.id ?? null);
    }
    async list(scope, user) {
        const branchId = this.getBranchId(user);
        const now = new Date();
        const today0 = startOfDayUTC(now);
        const where = { branchId };
        if (scope === 'today') {
            where.dueDate = { gte: today0, lt: addDaysUTC(today0, 1) };
        }
        else if (scope === 'week') {
            where.dueDate = { gte: today0, lt: addDaysUTC(today0, 7) };
        }
        else if (scope === 'month') {
            where.dueDate = { gte: today0, lt: addDaysUTC(today0, 31) };
        }
        else if (scope === 'overdue') {
            where.dueDate = { lt: today0 };
            where.status = { notIn: ['DONE', 'CANCELED'] };
        }
        return this.prisma.task.findMany({
            where,
            orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        });
    }
    async create(dto, user) {
        const branchId = this.getBranchId(user);
        const createdByUserId = this.getUserId(user);
        const t = await this.prisma.task.create({
            data: {
                branchId,
                title: dto.title,
                description: dto.description ?? null,
                status: dto.status ?? 'TODO',
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                assignedToUserId: dto.assignedToUserId ?? null,
                createdByUserId: createdByUserId ?? null,
            },
        });
        await this.audit.log(user, 'STUDENT_UPDATED', 'Task', t.id, { title: t.title });
        return t;
    }
    async update(id, dto, user) {
        const branchId = this.getBranchId(user);
        const t = await this.prisma.task.findUnique({ where: { id } });
        if (!t)
            throw new common_1.NotFoundException('Task not found');
        if (t.branchId !== branchId)
            throw new common_1.BadRequestException('Task belongs to another branch');
        const upd = await this.prisma.task.update({
            where: { id },
            data: {
                ...(dto.title !== undefined ? { title: dto.title } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.status !== undefined ? { status: dto.status } : {}),
                ...(dto.dueDate !== undefined ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null } : {}),
                ...(dto.assignedToUserId !== undefined ? { assignedToUserId: dto.assignedToUserId } : {}),
            },
        });
        await this.audit.log(user, 'STUDENT_UPDATED', 'Task', id, { updated: true });
        return upd;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map