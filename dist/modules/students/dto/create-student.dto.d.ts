export declare class ParentDto {
    fullName: string;
    phone: string;
    relationType?: string;
    email?: string;
}
export declare class CreateStudentDto {
    fullName: string;
    phone?: string;
    city?: string;
    email?: string;
    portfolio?: string;
    birthDate?: string;
    startStudyDate?: string;
    paymentDate?: string;
    groupId?: string;
    paymentMode?: string;
    paymentDueDay?: number;
    initialLessonBalance?: number;
    initialKiberons?: number;
    parents?: ParentDto[];
}
