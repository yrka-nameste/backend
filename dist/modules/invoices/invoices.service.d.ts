import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
export declare class InvoicesService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    private getBranchId;
    generateForBranch(dto: GenerateInvoicesDto, user: AuthUser): Promise<{
        created: number;
        period: string;
    }>;
    listStudent(studentId: string, user: AuthUser, period?: string): Promise<{
        student: {
            id: string;
            fullName: string;
            status: import("@prisma/client").$Enums.StudentStatus;
        };
        period: string;
        monthlyPrice: number;
        invoices: ({
            payments: {
                studentId: string;
                id: string;
                createdAt: Date;
                amount: number;
                comment: string | null;
                createdByUserId: string | null;
                paidAt: Date;
                method: string;
                receiptUrl: string | null;
                source: string;
                invoiceId: string | null;
            }[];
        } & {
            studentId: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            amount: number;
            period: string;
            dueDate: Date;
        })[];
        monthPayments: {
            studentId: string;
            id: string;
            createdAt: Date;
            amount: number;
            comment: string | null;
            createdByUserId: string | null;
            paidAt: Date;
            method: string;
            receiptUrl: string | null;
            source: string;
            invoiceId: string | null;
        }[];
        totals: {
            totalInvoiced: number;
            totalPaidByInvoices: number;
            monthPaid: number;
            hasMonthPayment: boolean;
            currentMonthDebt: number;
        };
    }>;
    debtors(user: AuthUser, onlyNegative: boolean, period?: string): Promise<any[]>;
}
export {};
