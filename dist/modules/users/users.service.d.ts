import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
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
    getTeachers(user: any): Promise<{
        id: string;
        fullName: string | null;
        email: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
}
