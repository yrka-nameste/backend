import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateShopItemDto } from './dto/create-item.dto';
import { CreateShopOrderDto } from './dto/create-order.dto';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
export declare class ShopService {
    private prisma;
    private audit;
    private notifications;
    constructor(prisma: PrismaService, audit: AuditService, notifications: NotificationsService);
    private getBranchId;
    private getUserId;
    listItems(visible: string | undefined, user: AuthUser): Promise<{
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        imageUrl: string | null;
        priceKiber: number;
        isVisible: boolean;
    }[]>;
    createItem(dto: CreateShopItemDto, user: AuthUser): Promise<{
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        imageUrl: string | null;
        priceKiber: number;
        isVisible: boolean;
    }>;
    updateItem(id: string, dto: CreateShopItemDto, user: AuthUser): Promise<{
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        imageUrl: string | null;
        priceKiber: number;
        isVisible: boolean;
    }>;
    listOrders(status: string | undefined, user: AuthUser): Promise<({
        student: {
            status: import("@prisma/client").$Enums.StudentStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            fullName: string;
            paymentDate: Date | null;
            portfolio: string | null;
            email: string | null;
            city: string | null;
            phone: string | null;
            birthDate: Date | null;
            startStudyDate: Date | null;
            paymentMode: string | null;
            paymentDueDay: number | null;
            contractNumber: string | null;
            leadSource: string | null;
            managerComment: string | null;
            trialLessonDate: Date | null;
            needsContact: boolean;
            documentsIncomplete: boolean;
        };
        item: {
            description: string | null;
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            imageUrl: string | null;
            priceKiber: number;
            isVisible: boolean;
        };
    } & {
        studentId: string;
        status: import("@prisma/client").$Enums.ShopOrderStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        comment: string | null;
        itemId: string;
        decidedByUserId: string | null;
    })[]>;
    createOrder(dto: CreateShopOrderDto, user: AuthUser): Promise<{
        studentId: string;
        status: import("@prisma/client").$Enums.ShopOrderStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        comment: string | null;
        itemId: string;
        decidedByUserId: string | null;
    }>;
    approve(orderId: string, user: AuthUser): Promise<{
        ok: boolean;
    }>;
    reject(orderId: string, user: AuthUser): Promise<{
        ok: boolean;
    }>;
}
export {};
