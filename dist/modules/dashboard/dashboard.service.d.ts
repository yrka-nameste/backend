import { PrismaService } from '../../prisma/prisma.service';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    private getBranchId;
    summary(user: AuthUser): Promise<{
        activeStudents: number;
        revenueMonth: number;
        debt: number;
        paymentsCountMonth: number;
        totalInvoiced: number;
        totalPaid: number;
        monthStart: string;
        monthEnd: string;
    }>;
}
export {};
