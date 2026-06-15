import { PrismaService } from '../../prisma/prisma.service';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getBranchId;
    debtors(user: AuthUser, onlyNegative?: boolean): Promise<{
        id: string;
        fullName: string;
        phone: string | null;
        city: string | null;
        availableLessons: number;
    }[]>;
    overview(user: AuthUser, from?: string, to?: string): Promise<{
        period: {
            from: string;
            to: string;
        };
        payments: {
            totalAmount: number;
            count: number;
        };
        newStudents: number;
        lessonsCount: number;
        attendance: {
            PRESENT: number;
            ABSENT: number;
            LATE: number;
            EXCUSED: number;
        };
        kiberons: {
            totalAmount: number;
            txCount: number;
        };
        topPayers: {
            studentId: string;
            fullName: string;
            totalPaid: number;
        }[];
    }>;
    revenueDaily(user: AuthUser, from?: string, to?: string): Promise<{
        period: {
            from: string;
            to: string;
        };
        days: {
            date: string;
            amount: number;
        }[];
    }>;
    topGroups(user: AuthUser, from?: string, to?: string, limit?: number): Promise<{
        groupId: string;
        groupName: string;
        presentCount: number;
    }[]>;
}
export {};
