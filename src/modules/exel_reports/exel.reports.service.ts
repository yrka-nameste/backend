import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

type AuthUser = {
  userId?: string;
  id?: string;
  branchId?: string | null;
  role?: string;
  email?: string | null;
};

@Injectable()
export class ExelReportsService {
  constructor(private prisma: PrismaService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId ?? null;
    if (!branchId) {
      throw new BadRequestException('User has no branchId');
    }
    return branchId;
  }

  async buildAttendanceExcel(
    params: {
      groupId?: string;
      from?: string;
      to?: string;
    },
    user: AuthUser,
  ): Promise<Buffer> {
    const branchId = this.getBranchId(user);

    const where: any = {
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
      if (params.from) where.lesson.startsAt.gte = new Date(params.from);
      if (params.to) where.lesson.startsAt.lte = new Date(params.to);
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
        date: `${String(dt.getDate()).padStart(2, '0')}.${String(
          dt.getMonth() + 1,
        ).padStart(2, '0')}.${dt.getFullYear()}`,
        time: `${String(dt.getHours()).padStart(2, '0')}:${String(
          dt.getMinutes(),
        ).padStart(2, '0')}`,
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

  async buildLessonsExcel(
    params: {
      groupId?: string;
      teacherUserId?: string;
      from?: string;
      to?: string;
    },
    user: AuthUser,
  ): Promise<Buffer> {
    const branchId = this.getBranchId(user);

    const where: any = {
      group: {
        branchId,
      },
    };

    if (params.groupId) where.groupId = params.groupId;
    if (params.teacherUserId) where.teacherUserId = params.teacherUserId;

    if (params.from || params.to) {
      where.startsAt = {};
      if (params.from) where.startsAt.gte = new Date(params.from);
      if (params.to) where.startsAt.lte = new Date(params.to);
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
        date: `${String(s.getDate()).padStart(2, '0')}.${String(
          s.getMonth() + 1,
        ).padStart(2, '0')}.${s.getFullYear()}`,
        time: `${String(s.getHours()).padStart(2, '0')}:${String(
          s.getMinutes(),
        ).padStart(2, '0')} - ${String(e.getHours()).padStart(2, '0')}:${String(
          e.getMinutes(),
        ).padStart(2, '0')}`,
        group: l.group.name,
        topic: l.topic ?? '',
        teacher: l.teacher?.fullName ?? '',
        status: this.ruLessonStatus(l.status),
        location: (l as any).location ?? '',
        note: (l as any).lessonNote ?? '',
        homework: (l as any).homework ?? '',
      });
    });

    this.styleSheet(ws, 'Отчет по урокам');
    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private styleSheet(ws: ExcelJS.Worksheet, title: string) {
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
      if (rowNumber < 2) return;
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

  private ruAttendanceStatus(status: string) {
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

  private ruLessonStatus(status: string) {
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
}
