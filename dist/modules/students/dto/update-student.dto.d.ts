export declare class UpdateStudentDto {
    fullName?: string;
    phone?: string | null;
    city?: string | null;
    email?: string | null;
    status?: 'ACTIVE' | 'PAUSED' | 'LEFT';
    paymentMode?: 'FIXED_DAY' | 'WINDOW_1_8' | null;
    paymentDueDay?: number | null;
    contractNumber?: string | null;
    leadSource?: string | null;
    managerComment?: string | null;
    needsContact?: boolean;
    documentsIncomplete?: boolean;
    portfolio?: string | null;
    birthDate?: string | null;
    startStudyDate?: string | null;
    paymentDate?: string | null;
}
