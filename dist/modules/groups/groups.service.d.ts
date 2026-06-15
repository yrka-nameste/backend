import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { AddStudentDto } from './dto/add-student.dto';
import { CreateScheduleRuleDto } from './dto/create-schedule-rule.dto';
import { GenerateLessonsDto } from './dto/generate-lessons.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
    email?: string | null;
};
export declare class GroupsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getBranchId;
    private assertGroupInBranch;
    findAll(user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<({
        scheduleRule: {
            id: string;
            groupId: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            weekdays: string;
            timeStart: string;
            durationMin: number;
            repeatEveryWeeks: number;
            timezone: string | null;
        } | null;
        teachers: ({
            teacher: {
                id: string;
                fullName: string | null;
                email: string;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            groupId: string;
            teacherUserId: string;
            roleInGroup: string;
        })[];
        enrollments: ({
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
            id: string;
            groupId: string;
            createdAt: Date;
            fromDate: Date;
            toDate: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        ageCategory: string | null;
        year: number | null;
        isActive: boolean;
    })[]>;
    create(dto: CreateGroupDto, user: AuthUser): import("@prisma/client").Prisma.Prisma__GroupClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        ageCategory: string | null;
        year: number | null;
        isActive: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(groupId: string, dto: UpdateGroupDto, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        ageCategory: string | null;
        year: number | null;
        isActive: boolean;
    }>;
    archive(groupId: string, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        ageCategory: string | null;
        year: number | null;
        isActive: boolean;
    }>;
    restore(groupId: string, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        ageCategory: string | null;
        year: number | null;
        isActive: boolean;
    }>;
    assignTeacher(groupId: string, dto: AssignTeacherDto, user: AuthUser): Promise<{
        groupId: string;
        teacherUserId: string;
        roleInGroup: string;
    }>;
    getStudents(groupId: string, user: AuthUser): Promise<({
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
        id: string;
        groupId: string;
        createdAt: Date;
        fromDate: Date;
        toDate: Date | null;
    })[]>;
    addStudent(groupId: string, dto: AddStudentDto, user: AuthUser): Promise<{
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
        id: string;
        groupId: string;
        createdAt: Date;
        fromDate: Date;
        toDate: Date | null;
    }>;
    removeStudent(groupId: string, studentId: string, user: AuthUser): Promise<{
        studentId: string;
        id: string;
        groupId: string;
        createdAt: Date;
        fromDate: Date;
        toDate: Date | null;
    }>;
    setScheduleRule(groupId: string, dto: CreateScheduleRuleDto, user: AuthUser): Promise<{
        id: string;
        groupId: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        weekdays: string;
        timeStart: string;
        durationMin: number;
        repeatEveryWeeks: number;
        timezone: string | null;
    }>;
    getLessons(groupId: string, from: string | undefined, to: string | undefined, user: AuthUser): Promise<{
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
    }[]>;
    getOne(groupId: string, user: AuthUser): Promise<({
        scheduleRule: {
            id: string;
            groupId: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            weekdays: string;
            timeStart: string;
            durationMin: number;
            repeatEveryWeeks: number;
            timezone: string | null;
        } | null;
        teachers: ({
            teacher: {
                id: string;
                fullName: string | null;
                email: string;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            groupId: string;
            teacherUserId: string;
            roleInGroup: string;
        })[];
        enrollments: ({
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
            id: string;
            groupId: string;
            createdAt: Date;
            fromDate: Date;
            toDate: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        ageCategory: string | null;
        year: number | null;
        isActive: boolean;
    }) | null>;
    generateLessons(groupId: string, dto: GenerateLessonsDto, user: AuthUser): Promise<{
        created: number;
        message: string;
    } | {
        created: number;
        message?: undefined;
    }>;
}
export {};
