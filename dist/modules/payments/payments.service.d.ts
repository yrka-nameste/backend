import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
export declare class PaymentsService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    private getBranchId;
    private getUserId;
    private calculateLessonsFromAmount;
    create(dto: CreatePaymentDto, user: AuthUser): Promise<{
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
    getStudentPayments(studentId: string, user: AuthUser): Promise<({
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
export {};
