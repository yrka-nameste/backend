import { PrismaService } from '../../prisma/prisma.service';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string | null;
    role?: string;
    email?: string | null;
};
export declare class ExelReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getBranchId;
    buildAttendanceExcel(params: {
        groupId?: string;
        from?: string;
        to?: string;
    }, user: AuthUser): Promise<Buffer>;
    buildLessonsExcel(params: {
        groupId?: string;
        teacherUserId?: string;
        from?: string;
        to?: string;
    }, user: AuthUser): Promise<Buffer>;
    private styleSheet;
    private ruAttendanceStatus;
    private ruLessonStatus;
}
export {};
