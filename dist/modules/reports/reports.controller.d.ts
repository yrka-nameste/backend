import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reports;
    constructor(reports: ReportsService);
    debtors(req: any, mode?: string): Promise<{
        id: string;
        fullName: string;
        phone: string | null;
        city: string | null;
        availableLessons: number;
    }[]>;
    overview(req: any, from?: string, to?: string): Promise<{
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
    revenueDaily(req: any, from?: string, to?: string): Promise<{
        period: {
            from: string;
            to: string;
        };
        days: {
            date: string;
            amount: number;
        }[];
    }>;
    topGroups(req: any, from?: string, to?: string, limit?: string): Promise<{
        groupId: string;
        groupName: string;
        presentCount: number;
    }[]>;
}
