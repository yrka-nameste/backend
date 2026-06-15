import { PrismaService } from '../../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
export declare class LessonsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getBranchId;
    list(params: {
        groupId?: string;
        teacherUserId?: string;
        from?: string;
        to?: string;
    }, user: AuthUser): Promise<({
        group: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            branchId: string;
            ageCategory: string | null;
            year: number | null;
            isActive: boolean;
        };
        teacher: {
            id: string;
            fullName: string | null;
            email: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.LessonType;
        status: import("@prisma/client").$Enums.LessonStatus;
        id: string;
        groupId: string;
        startsAt: Date;
        endsAt: Date;
        topic: string | null;
        teacherUserId: string | null;
        isChargeable: boolean;
        closedAt: Date | null;
        closedReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        lessonNote: string | null;
        homework: string | null;
    })[]>;
    getOne(id: string, user: AuthUser): Promise<{
        group: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            branchId: string;
            ageCategory: string | null;
            year: number | null;
            isActive: boolean;
        };
        teacher: {
            id: string;
            fullName: string | null;
            email: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
        } | null;
        attendances: ({
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
        } & {
            studentId: string;
            status: import("@prisma/client").$Enums.AttendanceStatus;
            lessonId: string;
            markedByUserId: string | null;
            kiberonsAwarded: number;
        })[];
    } & {
        type: import("@prisma/client").$Enums.LessonType;
        status: import("@prisma/client").$Enums.LessonStatus;
        id: string;
        groupId: string;
        startsAt: Date;
        endsAt: Date;
        topic: string | null;
        teacherUserId: string | null;
        isChargeable: boolean;
        closedAt: Date | null;
        closedReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        lessonNote: string | null;
        homework: string | null;
    }>;
    create(dto: CreateLessonDto, user: AuthUser): Promise<{
        group: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            branchId: string;
            ageCategory: string | null;
            year: number | null;
            isActive: boolean;
        };
        teacher: {
            id: string;
            fullName: string | null;
            email: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.LessonType;
        status: import("@prisma/client").$Enums.LessonStatus;
        id: string;
        groupId: string;
        startsAt: Date;
        endsAt: Date;
        topic: string | null;
        teacherUserId: string | null;
        isChargeable: boolean;
        closedAt: Date | null;
        closedReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        lessonNote: string | null;
        homework: string | null;
    }>;
    update(id: string, dto: UpdateLessonDto, user: AuthUser): Promise<{
        group: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            branchId: string;
            ageCategory: string | null;
            year: number | null;
            isActive: boolean;
        };
        teacher: {
            id: string;
            fullName: string | null;
            email: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.LessonType;
        status: import("@prisma/client").$Enums.LessonStatus;
        id: string;
        groupId: string;
        startsAt: Date;
        endsAt: Date;
        topic: string | null;
        teacherUserId: string | null;
        isChargeable: boolean;
        closedAt: Date | null;
        closedReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        lessonNote: string | null;
        homework: string | null;
    }>;
}
export {};
