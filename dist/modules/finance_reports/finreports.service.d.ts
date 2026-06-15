import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
export declare class FinReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getBranchId;
    getFinanceSummary(user: AuthUser, period?: string): Promise<{
        period: string;
        monthlyPrice: number;
        activeStudentsCount: number;
        paidStudentsCount: number;
        debtorsCount: number;
        expectedIncome: number;
        totalIncome: number;
        totalDebt: number;
        paymentsCount: number;
    }>;
    getFinancePayments(user: AuthUser, filters: {
        period?: string;
        method?: string;
        source?: string;
        q?: string;
    }): Promise<{
        id: string;
        studentId: string;
        studentName: string;
        studentPhone: string;
        studentEmail: string;
        amount: number;
        method: string;
        source: string;
        comment: string | null;
        receiptUrl: string | null;
        paidAt: Date;
        invoiceId: string | null;
        invoicePeriod: string | null;
        invoiceStatus: import("@prisma/client").$Enums.InvoiceStatus | null;
    }[]>;
    generateFinanceExcel(user: AuthUser, period?: string): Promise<{
        filename: string;
        buffer: Buffer<ExcelJS.Buffer>;
    }>;
    private getLastSixMonths;
    private fillSummarySheet;
    private fillPaymentsSheet;
    private fillDebtsSheet;
    private fillShopSheet;
    private fillChartsSheet;
    private makeBar;
    private styleHeader;
    private styleCustomHeader;
}
export {};
