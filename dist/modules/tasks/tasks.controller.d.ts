import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
export declare class TasksController {
    private readonly tasks;
    constructor(tasks: TasksService);
    list(scope: string | undefined, req: any): Promise<{
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
    create(dto: CreateTaskDto, req: any): Promise<{
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
    update(id: string, dto: CreateTaskDto, req: any): Promise<{
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
