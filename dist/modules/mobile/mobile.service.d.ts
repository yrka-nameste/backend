import { PrismaService } from '../../prisma/prisma.service';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
    email?: string | null;
};
export declare class MobileService {
    private prisma;
    constructor(prisma: PrismaService);
    private getBranchId;
    private getUserId;
    parentHome(studentId: string, user: AuthUser): Promise<{
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
            enrollments: ({
                group: {
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
                            phone: string | null;
                        };
                    } & {
                        groupId: string;
                        teacherUserId: string;
                        roleInGroup: string;
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
        kiberBalance: number;
        availableLessons: number;
        nextPayment: {
            studentId: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            amount: number;
            period: string;
            dueDate: Date;
        };
        recentAttendances: ({
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
        paymentStatusThisMonth: string;
        totalInvoicedThisMonth: number;
        totalPaidThisMonth: number;
    }>;
    parentKiberons(studentId: string, user: AuthUser): Promise<{
        tx: {
            studentId: string;
            id: string;
            createdAt: Date;
            lessonId: string | null;
            amount: number;
            reason: import("@prisma/client").$Enums.KiberonReason;
            comment: string | null;
            createdByUserId: string | null;
        }[];
        orders: ({
            item: {
                description: string | null;
                title: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                branchId: string;
                imageUrl: string | null;
                priceKiber: number;
                isVisible: boolean;
            };
        } & {
            studentId: string;
            status: import("@prisma/client").$Enums.ShopOrderStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            comment: string | null;
            itemId: string;
            decidedByUserId: string | null;
        })[];
    }>;
    parentShop(studentId: string, user: AuthUser): Promise<{
        items: {
            description: string | null;
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            imageUrl: string | null;
            priceKiber: number;
            isVisible: boolean;
        }[];
        orders: ({
            item: {
                description: string | null;
                title: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                branchId: string;
                imageUrl: string | null;
                priceKiber: number;
                isVisible: boolean;
            };
        } & {
            studentId: string;
            status: import("@prisma/client").$Enums.ShopOrderStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            comment: string | null;
            itemId: string;
            decidedByUserId: string | null;
        })[];
    }>;
    parentPayments(studentId: string, user: AuthUser): Promise<{
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
    }>;
    teacherHome(user: AuthUser): Promise<{
        groups: ({
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
            groupId: string;
            teacherUserId: string;
            roleInGroup: string;
        })[];
        upcomingLessons: ({
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
        })[];
    }>;
    teacherLessonsToday(user: AuthUser): Promise<({
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
    })[]>;
    teacherGroups(user: AuthUser): Promise<({
        group: {
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
        };
    } & {
        groupId: string;
        teacherUserId: string;
        roleInGroup: string;
    })[]>;
    teacherGroup(groupId: string, user: AuthUser): Promise<({
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
                phone: string | null;
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
        lessons: {
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
        }[];
        programs: {
            description: string | null;
            id: string;
            groupId: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            branchId: string;
            isActive: boolean;
            lessonsCount: number;
        }[];
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
    birthdays(user: AuthUser): Promise<{
        id: string;
        fullName: string;
        city: string | null;
        phone: string | null;
        birthDate: Date | null;
    }[]>;
    absentThisWeek(user: AuthUser): Promise<({
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
    })[]>;
}
export {};
