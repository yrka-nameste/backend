"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let StudentsService = class StudentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    genPassword(len = 10) {
        return crypto.randomBytes(32).toString('base64url').slice(0, len);
    }
    normPhone(phone) {
        return (phone || '').replace(/[^\d+]/g, '');
    }
    makeParentEmail(phone) {
        const p = this.normPhone(phone).replace('+', '');
        return `p${p}@parent.local`;
    }
    getAuthIds(authUser) {
        const branchId = authUser?.branchId ?? null;
        const userId = (authUser?.userId ?? authUser?.id ?? null);
        return { branchId, userId };
    }
    getBranchId(authUser) {
        const branchId = authUser?.branchId ?? null;
        if (!branchId) {
            throw new common_1.BadRequestException('User has no branchId (login with branch account)');
        }
        return branchId;
    }
    async list(branchId) {
        return this.prisma.student.findMany({
            where: { ...(branchId ? { branchId } : {}) },
            orderBy: { createdAt: 'desc' },
            include: {
                branch: true,
                parentLinks: { include: { parentUser: true } },
                enrollments: { include: { group: true } },
                lessonBalance: true,
            },
        });
    }
    async getCard(studentId) {
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                branch: true,
                lessonBalance: true,
                parentLinks: { include: { parentUser: true } },
                enrollments: {
                    orderBy: { createdAt: 'desc' },
                    include: { group: true },
                },
                attendances: {
                    orderBy: { lesson: { startsAt: 'desc' } },
                    take: 300,
                    include: { lesson: { include: { group: true } } },
                },
                invoices: {
                    orderBy: { createdAt: 'desc' },
                    take: 60,
                    include: { payments: { orderBy: { paidAt: 'desc' } } },
                },
                payments: {
                    orderBy: { paidAt: 'desc' },
                    take: 200,
                    include: { invoice: true },
                },
                kiberonTx: { orderBy: { createdAt: 'desc' }, take: 200 },
            },
        });
        if (!student)
            return null;
        const kiberAgg = await this.prisma.kiberonTransaction.aggregate({
            where: { studentId },
            _sum: { amount: true },
        });
        const kiberBalance = kiberAgg._sum.amount ?? 0;
        const invAgg = await this.prisma.invoice.aggregate({
            where: { studentId },
            _sum: { amount: true },
        });
        const payAgg = await this.prisma.payment.aggregate({
            where: { studentId },
            _sum: { amount: true },
        });
        const totalInvoiced = invAgg._sum.amount ?? 0;
        const totalPaid = payAgg._sum.amount ?? 0;
        const debt = totalInvoiced - totalPaid;
        const attendanceStats = student.attendances.reduce((acc, a) => {
            acc.total++;
            acc[a.status] = (acc[a.status] ?? 0) + 1;
            return acc;
        }, { total: 0 });
        return {
            student,
            totals: {
                kiberBalance,
                totalInvoiced,
                totalPaid,
                debt,
                availableLessons: student.lessonBalance?.availableLessons ?? 0,
            },
            attendanceStats,
        };
    }
    async createWithParents(dto, authUser) {
        const { branchId, userId } = this.getAuthIds(authUser);
        if (!branchId)
            throw new common_1.BadRequestException('User has no branchId (login with branch account)');
        if (!userId)
            throw new common_1.BadRequestException('User id missing in token');
        if (dto.groupId) {
            const g = await this.prisma.group.findUnique({
                where: { id: dto.groupId },
                select: { id: true, branchId: true },
            });
            if (!g)
                throw new common_1.BadRequestException('groupId not found');
            if (g.branchId !== branchId)
                throw new common_1.BadRequestException('groupId belongs to another branch');
        }
        return this.prisma.$transaction(async (tx) => {
            const student = await tx.student.create({
                data: {
                    branchId,
                    fullName: dto.fullName,
                    phone: dto.phone ?? null,
                    city: dto.city ?? null,
                    email: dto.email ?? null,
                    portfolio: dto.portfolio ?? null,
                    birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
                    startStudyDate: dto.startStudyDate ? new Date(dto.startStudyDate) : null,
                    paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
                    paymentMode: dto.paymentMode ?? null,
                    paymentDueDay: dto.paymentDueDay ?? null,
                },
                include: { branch: true },
            });
            if (dto.groupId) {
                await tx.enrollment.create({
                    data: {
                        studentId: student.id,
                        groupId: dto.groupId,
                        fromDate: new Date(),
                    },
                });
            }
            if ((dto.initialLessonBalance ?? 0) !== 0) {
                await tx.lessonBalance.upsert({
                    where: { studentId: student.id },
                    create: { studentId: student.id, availableLessons: dto.initialLessonBalance ?? 0 },
                    update: { availableLessons: dto.initialLessonBalance ?? 0 },
                });
            }
            if ((dto.initialKiberons ?? 0) !== 0) {
                await tx.kiberonTransaction.create({
                    data: {
                        studentId: student.id,
                        amount: dto.initialKiberons ?? 0,
                        reason: 'MANUAL',
                        createdByUserId: userId,
                    },
                });
            }
            const parentsOut = [];
            for (const p of dto.parents ?? []) {
                const login = (p.email && String(p.email).trim().length > 0)
                    ? String(p.email).trim()
                    : this.makeParentEmail(String(p.phone));
                const password = this.genPassword(10);
                const passwordHash = await bcrypt.hash(password, 10);
                const parentUser = await tx.user.upsert({
                    where: { email: login },
                    update: {
                        role: 'PARENT',
                        branchId,
                        fullName: p.fullName ?? undefined,
                        phone: p.phone ?? undefined,
                        isActive: true,
                    },
                    create: {
                        email: login,
                        passwordHash,
                        role: 'PARENT',
                        branchId,
                        fullName: p.fullName,
                        phone: p.phone,
                        isActive: true,
                    },
                });
                await tx.parentStudent.upsert({
                    where: { parentUserId_studentId: { parentUserId: parentUser.id, studentId: student.id } },
                    update: { relationType: p.relationType ?? null },
                    create: { parentUserId: parentUser.id, studentId: student.id, relationType: p.relationType ?? null },
                });
                parentsOut.push({
                    userId: parentUser.id,
                    fullName: p.fullName,
                    phone: p.phone,
                    login,
                    password,
                });
            }
            return { student, parents: parentsOut };
        });
    }
    async listForParent(parentUserId) {
        return this.prisma.student.findMany({
            where: {
                parentLinks: {
                    some: { parentUserId },
                },
            },
            orderBy: { createdAt: 'desc' },
            include: {
                branch: true,
                parentLinks: { include: { parentUser: true } },
                enrollments: { include: { group: true } },
                lessonBalance: true,
            },
        });
    }
    async update(id, dto, authUser) {
        const { branchId } = this.getAuthIds(authUser ?? {});
        const existing = await this.prisma.student.findUnique({ where: { id }, select: { id: true, branchId: true } });
        if (!existing)
            throw new common_1.NotFoundException('Student not found');
        if (branchId && existing.branchId !== branchId)
            throw new common_1.BadRequestException('Forbidden: another branch');
        return this.prisma.student.update({
            where: { id },
            data: {
                fullName: dto.fullName ?? undefined,
                phone: dto.phone ?? undefined,
                city: dto.city ?? undefined,
                email: dto.email ?? undefined,
                portfolio: dto.portfolio ?? undefined,
                birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
                startStudyDate: dto.startStudyDate ? new Date(dto.startStudyDate) : undefined,
                paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
                status: dto.status,
                paymentMode: dto.paymentMode ?? undefined,
                paymentDueDay: dto.paymentDueDay ?? undefined,
            },
            include: { branch: true },
        });
    }
    async archive(id) {
        return this.prisma.student.update({ where: { id }, data: { status: 'LEFT' } });
    }
    async restore(id) {
        return this.prisma.student.update({ where: { id }, data: { status: 'ACTIVE' } });
    }
    async addParent(studentId, dto, authUser) {
        const { branchId } = this.getAuthIds(authUser ?? {});
        const student = await this.prisma.student.findUnique({ where: { id: studentId }, select: { id: true, branchId: true } });
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        if (branchId && student.branchId !== branchId)
            throw new common_1.BadRequestException('Forbidden: another branch');
        const login = dto.email?.trim() ? dto.email.trim() : this.makeParentEmail(dto.phone);
        const tempPass = dto.password?.trim() || this.genPassword(10);
        const hash = await bcrypt.hash(tempPass, 10);
        const parent = await this.prisma.user.upsert({
            where: { email: login },
            update: {
                role: 'PARENT',
                branchId: student.branchId,
                fullName: dto.fullName ?? undefined,
                phone: dto.phone ?? undefined,
                isActive: true,
            },
            create: {
                email: login,
                passwordHash: hash,
                role: 'PARENT',
                branchId: student.branchId,
                fullName: dto.fullName ?? login,
                phone: dto.phone,
                isActive: true,
            },
        });
        const link = await this.prisma.parentStudent.upsert({
            where: { parentUserId_studentId: { parentUserId: parent.id, studentId } },
            update: { relationType: dto.relationType ?? null },
            create: { parentUserId: parent.id, studentId, relationType: dto.relationType ?? null },
            include: { parentUser: true, student: true },
        });
        return {
            link,
            tempPassword: dto.password ? undefined : tempPass,
        };
    }
    async resetParentPassword(studentId, dto, user) {
        const branchId = this.getBranchId(user);
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                parentLinks: {
                    include: {
                        parentUser: true,
                    },
                },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        if (student.branchId !== branchId) {
            throw new common_1.BadRequestException('Student belongs to another branch');
        }
        const link = student.parentLinks.find((x) => x.parentUserId === dto.parentUserId);
        if (!link) {
            throw new common_1.BadRequestException('Parent is not linked to this student');
        }
        const parent = link.parentUser;
        if (!parent) {
            throw new common_1.NotFoundException('Parent user not found');
        }
        if (parent.branchId !== branchId) {
            throw new common_1.BadRequestException('Parent belongs to another branch');
        }
        const newPassword = this.genPassword(8);
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: parent.id },
            data: {
                passwordHash,
            },
        });
        return {
            parentUserId: parent.id,
            fullName: parent.fullName,
            login: parent.email,
            password: newPassword,
        };
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsService);
//# sourceMappingURL=students.service.js.map