import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(role?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        isActive: boolean;
        fullName: string | null;
        email: string;
        phone: string | null;
        passwordHash: string;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        isActive: boolean;
        fullName: string | null;
        email: string;
        phone: string | null;
        passwordHash: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    getTeachers(req: any): Promise<{
        id: string;
        fullName: string | null;
        email: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
}
