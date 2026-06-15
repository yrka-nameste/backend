import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { AddStudentDto } from './dto/add-student.dto';
import { CreateScheduleRuleDto } from './dto/create-schedule-rule.dto';
import { GenerateLessonsDto } from './dto/generate-lessons.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    findAll(req: any): import("@prisma/client").Prisma.PrismaPromise<({
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
    getOne(id: string, req: any): Promise<({
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
    create(dto: CreateGroupDto, req: any): import("@prisma/client").Prisma.Prisma__GroupClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        ageCategory: string | null;
        year: number | null;
        isActive: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateGroupDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        ageCategory: string | null;
        year: number | null;
        isActive: boolean;
    }>;
    archive(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        ageCategory: string | null;
        year: number | null;
        isActive: boolean;
    }>;
    restore(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        ageCategory: string | null;
        year: number | null;
        isActive: boolean;
    }>;
    assignTeacher(id: string, dto: AssignTeacherDto, req: any): Promise<{
        groupId: string;
        teacherUserId: string;
        roleInGroup: string;
    }>;
    getStudents(id: string, req: any): Promise<({
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
    addStudent(id: string, dto: AddStudentDto, req: any): Promise<{
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
    removeStudent(id: string, studentId: string, req: any): Promise<{
        studentId: string;
        id: string;
        groupId: string;
        createdAt: Date;
        fromDate: Date;
        toDate: Date | null;
    }>;
    setScheduleRule(id: string, dto: CreateScheduleRuleDto, req: any): Promise<{
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
    getLessons(id: string, from: string | undefined, to: string | undefined, req: any): Promise<{
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
    generateLessons(id: string, dto: GenerateLessonsDto, req: any): Promise<{
        created: number;
        message: string;
    } | {
        created: number;
        message?: undefined;
    }>;
}
