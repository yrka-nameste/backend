export declare class CreatePaymentDto {
    studentId: string;
    amount: number;
    method?: string;
    comment?: string;
    receiptUrl?: string;
    addLessons?: number;
    source?: 'ADMIN_PANEL' | 'MOBILE_APP';
}
