import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AddParentDto } from './dto/add-parent.dto';
import { ResetParentPasswordDto } from './dto/reset-parent-password.dto';
export declare class StudentsController {
    private readonly students;
    constructor(students: StudentsService);
    list(req: any, branchId?: string): Promise<({
        branch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            city: string | null;
            address: string | null;
        };
        lessonBalance: {
            studentId: string;
            updatedAt: Date;
            availableLessons: number;
        } | null;
        enrollments: ({
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
        } & {
            studentId: string;
            id: string;
            groupId: string;
            createdAt: Date;
            fromDate: Date;
            toDate: Date | null;
        })[];
        parentLinks: ({
            parentUser: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                branchId: string | null;
                isActive: boolean;
                fullName: string | null;
                email: string;
                phone: string | null;
                passwordHash: string;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            studentId: string;
            relationType: string | null;
            parentUserId: string;
        })[];
    } & {
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
    })[]>;
    getCard(id: string): Promise<{
        student: {
            branch: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                city: string | null;
                address: string | null;
            };
            lessonBalance: {
                studentId: string;
                updatedAt: Date;
                availableLessons: number;
            } | null;
            attendances: ({
                lesson: {
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
                };
            } & {
                studentId: string;
                status: import("@prisma/client").$Enums.AttendanceStatus;
                lessonId: string;
                markedByUserId: string | null;
                kiberonsAwarded: number;
            })[];
            enrollments: ({
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
            } & {
                studentId: string;
                id: string;
                groupId: string;
                createdAt: Date;
                fromDate: Date;
                toDate: Date | null;
            })[];
            parentLinks: ({
                parentUser: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    branchId: string | null;
                    isActive: boolean;
                    fullName: string | null;
                    email: string;
                    phone: string | null;
                    passwordHash: string;
                    role: import("@prisma/client").$Enums.Role;
                };
            } & {
                studentId: string;
                relationType: string | null;
                parentUserId: string;
            })[];
            invoices: ({
                payments: {
                    studentId: string;
                    id: string;
                    createdAt: Date;
                    amount: number;
                    comment: string | null;
                    createdByUserId: string | null;
                    paidAt: Date;
                    method: string;
                    receiptUrl: string | null;
                    source: string;
                    invoiceId: string | null;
                }[];
            } & {
                studentId: string;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                branchId: string;
                amount: number;
                period: string;
                dueDate: Date;
            })[];
            payments: ({
                invoice: {
                    studentId: string;
                    status: import("@prisma/client").$Enums.InvoiceStatus;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    branchId: string;
                    amount: number;
                    period: string;
                    dueDate: Date;
                } | null;
            } & {
                studentId: string;
                id: string;
                createdAt: Date;
                amount: number;
                comment: string | null;
                createdByUserId: string | null;
                paidAt: Date;
                method: string;
                receiptUrl: string | null;
                source: string;
                invoiceId: string | null;
            })[];
            kiberonTx: {
                studentId: string;
                id: string;
                createdAt: Date;
                lessonId: string | null;
                amount: number;
                reason: import("@prisma/client").$Enums.KiberonReason;
                comment: string | null;
                createdByUserId: string | null;
            }[];
        } & {
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
        totals: {
            kiberBalance: number;
            totalInvoiced: number;
            totalPaid: number;
            debt: number;
            availableLessons: number;
        };
        attendanceStats: Record<string, number>;
    } | null>;
    create(dto: CreateStudentDto, req: any): Promise<{
        student: {
            branch: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                city: string | null;
                address: string | null;
            };
        } & {
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
        parents: {
            userId: string;
            fullName: string;
            phone: string;
            login: string;
            password: string;
        }[];
    }>;
    update(id: string, dto: UpdateStudentDto, req: any): Promise<{
        branch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            city: string | null;
            address: string | null;
        };
    } & {
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
    }>;
    archive(id: string): Promise<{
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
    }>;
    restore(id: string): Promise<{
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
    }>;
    addParent(id: string, dto: AddParentDto, req: any): Promise<{
        link: {
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
            parentUser: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                branchId: string | null;
                isActive: boolean;
                fullName: string | null;
                email: string;
                phone: string | null;
                passwordHash: string;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            studentId: string;
            relationType: string | null;
            parentUserId: string;
        };
        tempPassword: string | undefined;
    }>;
    resetParentPassword(id: string, dto: ResetParentPasswordDto, req: any): Promise<{
        parentUserId: string;
        fullName: string | null;
        login: string;
        password: string;
    }>;
}
