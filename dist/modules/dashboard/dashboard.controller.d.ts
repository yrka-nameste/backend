import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboard;
    constructor(dashboard: DashboardService);
    summary(req: any): Promise<{
        activeStudents: number;
        revenueMonth: number;
        debt: number;
        paymentsCountMonth: number;
        totalInvoiced: number;
        totalPaid: number;
        monthStart: string;
        monthEnd: string;
    }>;
}
