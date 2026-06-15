import { PrismaService } from '../../prisma/prisma.service';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
type PrismaLike = PrismaService | any;
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getBranchId;
    private ensureAdmin;
    createPaymentNotification(client: PrismaLike, args: {
        branchId: string;
        paymentId: string;
        studentName: string;
        amount: number;
        method?: string | null;
        receiptUrl?: string | null;
    }): Promise<any>;
    createShopOrderNotification(client: PrismaLike, args: {
        branchId: string;
        orderId: string;
        studentName: string;
        itemTitle: string;
        priceKiber: number;
    }): Promise<any>;
    summary(user: AuthUser): Promise<{
        unreadTotal: number;
        unreadPayments: number;
        unreadShopOrders: number;
        pendingShopOrders: number;
        latest: {
            type: import("@prisma/client").$Enums.AdminNotificationType;
            title: string;
            status: import("@prisma/client").$Enums.AdminNotificationStatus;
            id: string;
            createdAt: Date;
            branchId: string;
            message: string;
            entity: string | null;
            entityId: string | null;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            readAt: Date | null;
        }[];
    }>;
    list(user: AuthUser, status?: string, take?: string): Promise<{
        type: import("@prisma/client").$Enums.AdminNotificationType;
        title: string;
        status: import("@prisma/client").$Enums.AdminNotificationStatus;
        id: string;
        createdAt: Date;
        branchId: string;
        message: string;
        entity: string | null;
        entityId: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        readAt: Date | null;
    }[]>;
    markRead(user: AuthUser, ids?: string[]): Promise<{
        ok: boolean;
        updated: number;
        summary: {
            unreadTotal: number;
            unreadPayments: number;
            unreadShopOrders: number;
            pendingShopOrders: number;
            latest: {
                type: import("@prisma/client").$Enums.AdminNotificationType;
                title: string;
                status: import("@prisma/client").$Enums.AdminNotificationStatus;
                id: string;
                createdAt: Date;
                branchId: string;
                message: string;
                entity: string | null;
                entityId: string | null;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
                readAt: Date | null;
            }[];
        };
    }>;
}
export {};
