import { PrismaService } from '../../prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    private getBranchId;
    private getUserId;
    getLessonAttendance(lessonId: string, user: AuthUser): Promise<{
        studentId: string;
        student: {
            status: import("@prisma/client").$Enums.StudentStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            fullName: string;
            paymentDate: Date | null;
            portfolio: string | null;
            email: string | null;
            city: string | null;
            phone: string | null;
            birthDate: Date | null;
            startStudyDate: Date | null;
            paymentMode: string | null;
            paymentDueDay: number | null;
            contractNumber: string | null;
            leadSource: string | null;
            managerComment: string | null;
            trialLessonDate: Date | null;
            needsContact: boolean;
            documentsIncomplete: boolean;
        };
        status: import("@prisma/client").$Enums.AttendanceStatus | null;
        kiberonsAwarded: number;
    }[]>;
    setAttendance(lessonId: string, dto: MarkAttendanceDto, user: AuthUser): Promise<{
        ok: boolean;
        mark: {
            studentId: string;
            status: import("@prisma/client").$Enums.AttendanceStatus;
            lessonId: string;
            markedByUserId: string | null;
            kiberonsAwarded: number;
        };
    }>;
}
export {};
