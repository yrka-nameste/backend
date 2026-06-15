import type { Response } from 'express';
import { FinReportsService } from './finreports.service';
export declare class FinReportsController {
    private readonly finReports;
    constructor(finReports: FinReportsService);
    summary(period: string | undefined, req: any): Promise<{
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
    payments(period: string | undefined, method: string | undefined, source: string | undefined, q: string | undefined, req: any): Promise<{
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
    excel(period: string | undefined, req: any, res: Response): Promise<void>;
}
