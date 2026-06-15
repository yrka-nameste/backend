import type { Response } from 'express';
import { ExelReportsService } from './exel.reports.service';
export declare class ExelReportsController {
    private readonly reports;
    constructor(reports: ExelReportsService);
    attendanceExcel(groupId: string | undefined, from: string | undefined, to: string | undefined, req: any, res: Response): Promise<void>;
    lessonsExcel(groupId: string | undefined, teacherUserId: string | undefined, from: string | undefined, to: string | undefined, req: any, res: Response): Promise<void>;
}
