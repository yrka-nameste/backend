import { InvoicesService } from './invoices.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';
export declare class InvoicesController {
    private readonly invoices;
    constructor(invoices: InvoicesService);
    generate(dto: GenerateInvoicesDto, req: any): Promise<{
        created: number;
        period: string;
    }>;
    listStudent(studentId: string, period: string | undefined, req: any): Promise<{
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
    debtors(mode: string | undefined, period: string | undefined, req: any): Promise<any[]>;
}
