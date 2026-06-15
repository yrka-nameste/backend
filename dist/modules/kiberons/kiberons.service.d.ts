import { PrismaService } from '../../prisma/prisma.service';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
export declare class KiberonsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getBranchId;
    private getUserId;
    create(dto: any, user: AuthUser): Promise<{
        tx: {
            studentId: string;
            id: string;
            createdAt: Date;
            lessonId: string | null;
            amount: number;
            reason: import("@prisma/client").$Enums.KiberonReason;
            comment: string | null;
            createdByUserId: string | null;
        };
        balance: number;
    }>;
    getStudentKiberons(studentId: string, user: AuthUser): Promise<{
        studentId: string;
        id: string;
        createdAt: Date;
        lessonId: string | null;
        amount: number;
        reason: import("@prisma/client").$Enums.KiberonReason;
        comment: string | null;
        createdByUserId: string | null;
    }[]>;
    getStudentKiberonsBalance(studentId: string, user: AuthUser): Promise<{
        studentId: string;
        balance: number;
    }>;
}
export {};
