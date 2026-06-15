import { ShopService } from './shop.service';
import { CreateShopItemDto } from './dto/create-item.dto';
import { CreateShopOrderDto } from './dto/create-order.dto';
export declare class ShopController {
    private readonly shop;
    constructor(shop: ShopService);
    listItems(visible: string | undefined, req: any): Promise<{
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
    createItem(dto: CreateShopItemDto, req: any): Promise<{
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
    updateItem(id: string, dto: CreateShopItemDto, req: any): Promise<{
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
    listOrders(status: string | undefined, req: any): Promise<({
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
    createOrder(dto: CreateShopOrderDto, req: any): Promise<{
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
    approve(id: string, req: any): Promise<{
        ok: boolean;
    }>;
    reject(id: string, req: any): Promise<{
        ok: boolean;
    }>;
}
