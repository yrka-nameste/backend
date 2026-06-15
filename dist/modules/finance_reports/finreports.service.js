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
exports.FinReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
const MONTHLY_PRICE = 750;
function getCurrentPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}
function normalizePeriod(period) {
    if (!period)
        return getCurrentPeriod();
    if (!/^\d{4}-\d{2}$/.test(period)) {
        throw new common_1.BadRequestException('period must be in YYYY-MM format');
    }
    return period;
}
function getMonthRange(period) {
    const [year, month] = period.split('-').map((x) => parseInt(x, 10));
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    return { start, end };
}
function formatDate(date) {
    return date.toISOString().slice(0, 10);
}
let FinReportsService = class FinReportsService {
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
    async getFinanceSummary(user, period) {
        const branchId = this.getBranchId(user);
        const normalizedPeriod = normalizePeriod(period);
        const { start, end } = getMonthRange(normalizedPeriod);
        const activeStudents = await this.prisma.student.findMany({
            where: {
                branchId,
                status: 'ACTIVE',
            },
            select: {
                id: true,
            },
        });
        const payments = await this.prisma.payment.findMany({
            where: {
                student: {
                    branchId,
                },
                paidAt: {
                    gte: start,
                    lt: end,
                },
            },
            select: {
                studentId: true,
                amount: true,
            },
        });
        const paidStudentIds = new Set();
        let totalIncome = 0;
        for (const payment of payments) {
            totalIncome += payment.amount;
            if (payment.amount > 0) {
                paidStudentIds.add(payment.studentId);
            }
        }
        const activeStudentsCount = activeStudents.length;
        const paidStudentsCount = paidStudentIds.size;
        const debtorsCount = Math.max(0, activeStudentsCount - paidStudentsCount);
        const expectedIncome = activeStudentsCount * MONTHLY_PRICE;
        const totalDebt = debtorsCount * MONTHLY_PRICE;
        return {
            period: normalizedPeriod,
            monthlyPrice: MONTHLY_PRICE,
            activeStudentsCount,
            paidStudentsCount,
            debtorsCount,
            expectedIncome,
            totalIncome,
            totalDebt,
            paymentsCount: payments.length,
        };
    }
    async getFinancePayments(user, filters) {
        const branchId = this.getBranchId(user);
        const normalizedPeriod = normalizePeriod(filters.period);
        const { start, end } = getMonthRange(normalizedPeriod);
        const where = {
            student: {
                branchId,
            },
            paidAt: {
                gte: start,
                lt: end,
            },
        };
        if (filters.method && filters.method !== 'ALL') {
            where.method = filters.method;
        }
        if (filters.source && filters.source !== 'ALL') {
            where.source = filters.source;
        }
        if (filters.q && filters.q.trim().length > 0) {
            where.student = {
                branchId,
                fullName: {
                    contains: filters.q.trim(),
                    mode: 'insensitive',
                },
            };
        }
        const payments = await this.prisma.payment.findMany({
            where,
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        email: true,
                    },
                },
                invoice: {
                    select: {
                        id: true,
                        period: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                paidAt: 'desc',
            },
        });
        return payments.map((payment) => ({
            id: payment.id,
            studentId: payment.studentId,
            studentName: payment.student?.fullName ?? '',
            studentPhone: payment.student?.phone ?? '',
            studentEmail: payment.student?.email ?? '',
            amount: payment.amount,
            method: payment.method,
            source: payment.source ?? '',
            comment: payment.comment,
            receiptUrl: payment.receiptUrl,
            paidAt: payment.paidAt,
            invoiceId: payment.invoiceId,
            invoicePeriod: payment.invoice?.period ?? null,
            invoiceStatus: payment.invoice?.status ?? null,
        }));
    }
    async generateFinanceExcel(user, period) {
        const branchId = this.getBranchId(user);
        const normalizedPeriod = normalizePeriod(period);
        const { start, end } = getMonthRange(normalizedPeriod);
        const branch = await this.prisma.branch.findUnique({
            where: {
                id: branchId,
            },
        });
        const activeStudents = await this.prisma.student.findMany({
            where: {
                branchId,
                status: 'ACTIVE',
            },
            select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                status: true,
            },
            orderBy: {
                fullName: 'asc',
            },
        });
        const payments = await this.prisma.payment.findMany({
            where: {
                student: {
                    branchId,
                },
                paidAt: {
                    gte: start,
                    lt: end,
                },
            },
            include: {
                student: true,
                invoice: true,
            },
            orderBy: {
                paidAt: 'asc',
            },
        });
        const shopOrders = await this.prisma.shopOrder.findMany({
            where: {
                branchId,
                createdAt: {
                    gte: start,
                    lt: end,
                },
            },
            include: {
                student: true,
                item: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        const paidByStudent = new Map();
        for (const payment of payments) {
            const current = paidByStudent.get(payment.studentId) ?? 0;
            paidByStudent.set(payment.studentId, current + payment.amount);
        }
        const debtRows = activeStudents.map((student) => {
            const paid = paidByStudent.get(student.id) ?? 0;
            const hasPayment = paid > 0;
            const debt = hasPayment ? 0 : MONTHLY_PRICE;
            return {
                studentId: student.id,
                fullName: student.fullName,
                phone: student.phone ?? '',
                email: student.email ?? '',
                paid,
                hasPayment,
                debt,
            };
        });
        const debtors = debtRows.filter((row) => row.debt > 0);
        const paidStudents = debtRows.filter((row) => row.hasPayment);
        const totalIncome = payments.reduce((sum, payment) => {
            return sum + payment.amount;
        }, 0);
        const totalDebt = debtors.reduce((sum, row) => {
            return sum + row.debt;
        }, 0);
        const expectedIncome = activeStudents.length * MONTHLY_PRICE;
        const previousMonths = await this.getLastSixMonths(branchId, normalizedPeriod);
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'School CRM';
        workbook.created = new Date();
        workbook.modified = new Date();
        const summarySheet = workbook.addWorksheet('Сводка');
        const paymentsSheet = workbook.addWorksheet('Оплаты');
        const debtsSheet = workbook.addWorksheet('Долги');
        const shopSheet = workbook.addWorksheet('Магазин');
        const chartsSheet = workbook.addWorksheet('Графики');
        this.fillSummarySheet(summarySheet, {
            branchName: branch?.name ?? 'Филиал',
            period: normalizedPeriod,
            activeStudentsCount: activeStudents.length,
            paidStudentsCount: paidStudents.length,
            debtorsCount: debtors.length,
            expectedIncome,
            totalIncome,
            totalDebt,
            paymentsCount: payments.length,
            shopOrdersCount: shopOrders.length,
        });
        this.fillPaymentsSheet(paymentsSheet, payments);
        this.fillDebtsSheet(debtsSheet, debtRows);
        this.fillShopSheet(shopSheet, shopOrders);
        this.fillChartsSheet(chartsSheet, {
            previousMonths,
            paidStudentsCount: paidStudents.length,
            debtorsCount: debtors.length,
            totalIncome,
            totalDebt,
        });
        const rawBuffer = await workbook.xlsx.writeBuffer();
        const buffer = Buffer.from(rawBuffer);
        return {
            filename: `finance-report-${normalizedPeriod}.xlsx`,
            buffer,
        };
    }
    async getLastSixMonths(branchId, currentPeriod) {
        const [year, month] = currentPeriod
            .split('-')
            .map((x) => parseInt(x, 10));
        const result = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(Date.UTC(year, month - 1 - i, 1, 0, 0, 0));
            const period = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
            const { start, end } = getMonthRange(period);
            const payments = await this.prisma.payment.findMany({
                where: {
                    student: {
                        branchId,
                    },
                    paidAt: {
                        gte: start,
                        lt: end,
                    },
                },
                select: {
                    amount: true,
                },
            });
            const income = payments.reduce((sum, payment) => {
                return sum + payment.amount;
            }, 0);
            result.push({
                period,
                income,
            });
        }
        return result;
    }
    fillSummarySheet(sheet, data) {
        sheet.columns = [{ width: 32 }, { width: 22 }];
        sheet.mergeCells('A1:B1');
        sheet.getCell('A1').value = 'Финансовый отчёт';
        sheet.getCell('A1').font = {
            bold: true,
            size: 18,
        };
        const rows = [
            ['Филиал', data.branchName],
            ['Период', data.period],
            ['Активных учеников', data.activeStudentsCount],
            ['Учеников с оплатой', data.paidStudentsCount],
            ['Учеников с долгом', data.debtorsCount],
            ['Плановая сумма', data.expectedIncome],
            ['Получено оплат', data.totalIncome],
            ['Долг за месяц', data.totalDebt],
            ['Количество оплат', data.paymentsCount],
            ['Заказов в магазине', data.shopOrdersCount],
        ];
        sheet.addTable({
            name: 'FinSummaryTable',
            ref: 'A3',
            headerRow: true,
            totalsRow: false,
            style: {
                theme: 'TableStyleMedium2',
                showRowStripes: true,
            },
            columns: [{ name: 'Показатель' }, { name: 'Значение' }],
            rows,
        });
        for (let row = 3; row <= 13; row++) {
            sheet.getCell(`A${row}`).font = {
                bold: true,
            };
        }
        sheet.getCell('B8').numFmt = '#,##0 ₽';
        sheet.getCell('B9').numFmt = '#,##0 ₽';
        sheet.getCell('B10').numFmt = '#,##0 ₽';
    }
    fillPaymentsSheet(sheet, payments) {
        sheet.columns = [
            { header: 'Дата', key: 'paidAt', width: 14 },
            { header: 'Ученик', key: 'student', width: 32 },
            { header: 'Сумма', key: 'amount', width: 14 },
            { header: 'Метод', key: 'method', width: 16 },
            { header: 'Источник', key: 'source', width: 22 },
            { header: 'Период счёта', key: 'period', width: 16 },
            { header: 'Комментарий', key: 'comment', width: 40 },
            { header: 'Чек', key: 'receiptUrl', width: 40 },
        ];
        for (const payment of payments) {
            sheet.addRow({
                paidAt: formatDate(payment.paidAt),
                student: payment.student?.fullName ?? '',
                amount: payment.amount,
                method: payment.method,
                source: payment.source ?? '',
                period: payment.invoice?.period ?? '',
                comment: payment.comment ?? '',
                receiptUrl: payment.receiptUrl ?? '',
            });
        }
        this.styleHeader(sheet);
        sheet.getColumn('amount').numFmt = '#,##0 ₽';
    }
    fillDebtsSheet(sheet, rows) {
        sheet.columns = [
            { header: 'Ученик', key: 'fullName', width: 34 },
            { header: 'Телефон', key: 'phone', width: 18 },
            { header: 'Email', key: 'email', width: 28 },
            { header: 'Оплата за месяц', key: 'paid', width: 18 },
            { header: 'Есть оплата', key: 'hasPayment', width: 16 },
            { header: 'Долг', key: 'debt', width: 14 },
        ];
        for (const row of rows) {
            sheet.addRow({
                fullName: row.fullName,
                phone: row.phone,
                email: row.email,
                paid: row.paid,
                hasPayment: row.hasPayment ? 'Да' : 'Нет',
                debt: row.debt,
            });
        }
        this.styleHeader(sheet);
        sheet.getColumn('paid').numFmt = '#,##0 ₽';
        sheet.getColumn('debt').numFmt = '#,##0 ₽';
    }
    fillShopSheet(sheet, orders) {
        sheet.columns = [
            { header: 'Дата', key: 'createdAt', width: 14 },
            { header: 'Ученик', key: 'student', width: 32 },
            { header: 'Товар', key: 'item', width: 32 },
            { header: 'Цена, кибероны', key: 'priceKiber', width: 18 },
            { header: 'Статус', key: 'status', width: 16 },
            { header: 'Комментарий', key: 'comment', width: 40 },
        ];
        for (const order of orders) {
            sheet.addRow({
                createdAt: formatDate(order.createdAt),
                student: order.student?.fullName ?? '',
                item: order.item?.title ?? '',
                priceKiber: order.item?.priceKiber ?? 0,
                status: order.status,
                comment: order.comment ?? '',
            });
        }
        this.styleHeader(sheet);
    }
    fillChartsSheet(sheet, data) {
        sheet.columns = [{ width: 18 }, { width: 16 }, { width: 46 }];
        sheet.getCell('A1').value = 'Графики';
        sheet.getCell('A1').font = {
            bold: true,
            size: 18,
        };
        sheet.getCell('A3').value = 'Динамика оплат за 6 месяцев';
        sheet.getCell('A3').font = {
            bold: true,
            size: 14,
        };
        sheet.getRow(4).values = ['Месяц', 'Сумма', 'График'];
        const maxIncome = Math.max(...data.previousMonths.map((item) => item.income), 1);
        let rowIndex = 5;
        for (const item of data.previousMonths) {
            sheet.getRow(rowIndex).values = [
                item.period,
                item.income,
                this.makeBar(item.income, maxIncome),
            ];
            rowIndex++;
        }
        sheet.getCell(`A${rowIndex + 2}`).value = 'Оплаты и долги';
        sheet.getCell(`A${rowIndex + 2}`).font = {
            bold: true,
            size: 14,
        };
        const secondStart = rowIndex + 3;
        sheet.getRow(secondStart).values = ['Показатель', 'Значение', 'График'];
        const chartRows = [
            ['Учеников с оплатой', data.paidStudentsCount],
            ['Учеников с долгом', data.debtorsCount],
            ['Получено оплат', data.totalIncome],
            ['Долг за месяц', data.totalDebt],
        ];
        const maxValue = Math.max(...chartRows.map((item) => Number(item[1])), 1);
        let row = secondStart + 1;
        for (const item of chartRows) {
            sheet.getRow(row).values = [
                item[0],
                item[1],
                this.makeBar(Number(item[1]), maxValue),
            ];
            row++;
        }
        this.styleCustomHeader(sheet, 4);
        this.styleCustomHeader(sheet, secondStart);
    }
    makeBar(value, max, width = 32) {
        if (max <= 0 || value <= 0)
            return '';
        const count = Math.max(1, Math.round((value / max) * width));
        return '█'.repeat(count);
    }
    styleHeader(sheet) {
        sheet.views = [
            {
                state: 'frozen',
                ySplit: 1,
            },
        ];
        const headerRow = sheet.getRow(1);
        headerRow.font = {
            bold: true,
            color: {
                argb: 'FFFFFFFF',
            },
        };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
                argb: 'FF2563EB',
            },
        };
        headerRow.alignment = {
            vertical: 'middle',
            horizontal: 'center',
        };
        sheet.eachRow((row) => {
            row.alignment = {
                vertical: 'middle',
                wrapText: true,
            };
        });
    }
    styleCustomHeader(sheet, rowNumber) {
        const row = sheet.getRow(rowNumber);
        row.font = {
            bold: true,
            color: {
                argb: 'FFFFFFFF',
            },
        };
        row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
                argb: 'FF2563EB',
            },
        };
        row.alignment = {
            vertical: 'middle',
            horizontal: 'center',
        };
    }
};
exports.FinReportsService = FinReportsService;
exports.FinReportsService = FinReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinReportsService);
//# sourceMappingURL=finreports.service.js.map