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
exports.ExelReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
let ExelReportsService = class ExelReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getBranchId(user) {
        const branchId = user?.branchId ?? null;
        if (!branchId) {
            throw new common_1.BadRequestException('User has no branchId');
        }
        return branchId;
    }
    async buildAttendanceExcel(params, user) {
        const branchId = this.getBranchId(user);
        const where = {
            lesson: {
                group: {
                    branchId,
                },
            },
        };
        if (params.groupId) {
            where.lesson.groupId = params.groupId;
        }
        if (params.from || params.to) {
            where.lesson.startsAt = {};
            if (params.from)
                where.lesson.startsAt.gte = new Date(params.from);
            if (params.to)
                where.lesson.startsAt.lte = new Date(params.to);
        }
        const rows = await this.prisma.attendance.findMany({
            where,
            include: {
                student: true,
                lesson: {
                    include: {
                        group: true,
                    },
                },
            },
            orderBy: {
                lesson: {
                    startsAt: 'desc',
                },
            },
        });
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Attendance');
        ws.columns = [
            { header: 'Дата', key: 'date', width: 16 },
            { header: 'Время', key: 'time', width: 14 },
            { header: 'Группа', key: 'group', width: 26 },
            { header: 'Ученик', key: 'student', width: 30 },
            { header: 'Статус', key: 'status', width: 18 },
            { header: 'Кибероны', key: 'kiberons', width: 14 },
            { header: 'Тема', key: 'topic', width: 34 },
        ];
        rows.forEach((r) => {
            const dt = new Date(r.lesson.startsAt);
            ws.addRow({
                date: `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`,
                time: `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`,
                group: r.lesson.group.name,
                student: r.student.fullName,
                status: this.ruAttendanceStatus(r.status),
                kiberons: r.kiberonsAwarded,
                topic: r.lesson.topic ?? '',
            });
        });
        this.styleSheet(ws, 'Отчет по посещаемости');
        const buffer = await wb.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async buildLessonsExcel(params, user) {
        const branchId = this.getBranchId(user);
        const where = {
            group: {
                branchId,
            },
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
        const lessons = await this.prisma.lesson.findMany({
            where,
            include: {
                group: true,
                teacher: true,
            },
            orderBy: {
                startsAt: 'desc',
            },
        });
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Lessons');
        ws.columns = [
            { header: 'Дата', key: 'date', width: 16 },
            { header: 'Время', key: 'time', width: 16 },
            { header: 'Группа', key: 'group', width: 26 },
            { header: 'Тема', key: 'topic', width: 30 },
            { header: 'Преподаватель', key: 'teacher', width: 30 },
            { header: 'Статус', key: 'status', width: 16 },
            { header: 'Место', key: 'location', width: 24 },
            { header: 'Комментарий', key: 'note', width: 36 },
            { header: 'Домашнее задание', key: 'homework', width: 36 },
        ];
        lessons.forEach((l) => {
            const s = new Date(l.startsAt);
            const e = new Date(l.endsAt);
            ws.addRow({
                date: `${String(s.getDate()).padStart(2, '0')}.${String(s.getMonth() + 1).padStart(2, '0')}.${s.getFullYear()}`,
                time: `${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')} - ${String(e.getHours()).padStart(2, '0')}:${String(e.getMinutes()).padStart(2, '0')}`,
                group: l.group.name,
                topic: l.topic ?? '',
                teacher: l.teacher?.fullName ?? '',
                status: this.ruLessonStatus(l.status),
                location: l.location ?? '',
                note: l.lessonNote ?? '',
                homework: l.homework ?? '',
            });
        });
        this.styleSheet(ws, 'Отчет по урокам');
        const buffer = await wb.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    styleSheet(ws, title) {
        ws.insertRow(1, [title]);
        ws.mergeCells(1, 1, 1, ws.columnCount);
        const titleCell = ws.getCell(1, 1);
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        const headerRow = ws.getRow(2);
        headerRow.font = { bold: true };
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFEFF3FF' },
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            };
        });
        ws.eachRow((row, rowNumber) => {
            if (rowNumber < 2)
                return;
            row.eachCell((cell) => {
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'left',
                    wrapText: true,
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                };
            });
        });
    }
    ruAttendanceStatus(status) {
        switch (status) {
            case 'PRESENT':
                return 'Был';
            case 'ABSENT':
                return 'Отсутствовал';
            case 'LATE':
                return 'Опоздал';
            case 'EXCUSED':
                return 'Уважительная причина';
            default:
                return status;
        }
    }
    ruLessonStatus(status) {
        switch (status) {
            case 'DONE':
                return 'Проведен';
            case 'CANCELED':
                return 'Отменен';
            case 'PLANNED':
                return 'Запланирован';
            default:
                return status;
        }
    }
};
exports.ExelReportsService = ExelReportsService;
exports.ExelReportsService = ExelReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExelReportsService);
//# sourceMappingURL=exel.reports.service.js.map