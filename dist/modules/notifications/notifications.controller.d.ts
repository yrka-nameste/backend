import { NotificationsService } from './notifications.service';
import { MarkNotificationsReadDto } from './dto/mark-notifications-read.dto';
export declare class NotificationsController {
    private readonly notifications;
    constructor(notifications: NotificationsService);
    summary(req: any): Promise<{
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
    list(status: string | undefined, take: string | undefined, req: any): Promise<{
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
    markRead(dto: MarkNotificationsReadDto, req: any): Promise<{
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
    markAllRead(req: any): Promise<{
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
