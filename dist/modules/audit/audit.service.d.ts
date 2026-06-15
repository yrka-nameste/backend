import { PrismaService } from '../../prisma/prisma.service';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(user: AuthUser, action: any, entity?: string, entityId?: string, meta?: any): Promise<void>;
}
export {};
