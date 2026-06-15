import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { JwtUser } from './auth.types';
type RequestWithUser = {
    user: JwtUser;
};
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            branchId: string | null;
        };
    }>;
    me(req: RequestWithUser): Promise<{
        id: string;
        branchId: string | null;
        isActive: boolean;
        fullName: string | null;
        email: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
    } | null>;
}
export {};
