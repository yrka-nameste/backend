import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(dto: CreatePaymentDto, req: any): Promise<{
        payment: {
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
        };
        invoiceId: string;
        period: string;
        addedLessons: number;
        notificationCreated: boolean;
    }>;
    getStudentPayments(studentId: string, req: any): Promise<({
        invoice: {
            studentId: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            amount: number;
            period: string;
            dueDate: Date;
        } | null;
    } & {
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
    })[]>;
}
