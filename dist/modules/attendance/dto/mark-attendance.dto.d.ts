export declare class MarkAttendanceDto {
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    addBonus5?: boolean;
}
