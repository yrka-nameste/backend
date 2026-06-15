import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTaskDto } from './dto/create-task.dto';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
export declare class TasksService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    private getBranchId;
    private getUserId;
    list(scope: string, user: AuthUser): Promise<{
        description: string | null;
        title: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        createdByUserId: string | null;
        dueDate: Date | null;
        assignedToUserId: string | null;
    }[]>;
    create(dto: CreateTaskDto, user: AuthUser): Promise<{
        description: string | null;
        title: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        createdByUserId: string | null;
        dueDate: Date | null;
        assignedToUserId: string | null;
    }>;
    update(id: string, dto: CreateTaskDto, user: AuthUser): Promise<{
        description: string | null;
        title: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        createdByUserId: string | null;
        dueDate: Date | null;
        assignedToUserId: string | null;
    }>;
}
export {};
