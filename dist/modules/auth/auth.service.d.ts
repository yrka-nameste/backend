import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            branchId: string | null;
        };
    }>;
    me(userId: string): Promise<{
        id: string;
        branchId: string | null;
        isActive: boolean;
        fullName: string | null;
        email: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
    } | null>;
}
