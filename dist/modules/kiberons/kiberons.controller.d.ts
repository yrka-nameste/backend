import { KiberonsService } from './kiberons.service';
export declare class KiberonsController {
    private readonly kiberonsService;
    constructor(kiberonsService: KiberonsService);
    getStudentTx(studentId: string, req: any): Promise<{
        studentId: string;
        id: string;
        createdAt: Date;
        lessonId: string | null;
        amount: number;
        reason: import("@prisma/client").$Enums.KiberonReason;
        comment: string | null;
        createdByUserId: string | null;
    }[]>;
    getStudentBalance(studentId: string, req: any): Promise<{
        studentId: string;
        balance: number;
    }>;
    create(createKiberonDto: any, req: any): Promise<{
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
}
