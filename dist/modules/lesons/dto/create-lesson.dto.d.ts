export declare class CreateLessonDto {
    groupId: string;
    startsAt: string;
    endsAt: string;
    topic?: string;
    location?: string;
    teacherUserId?: string;
    isChargeable?: boolean;
    lessonNote?: string;
    homework?: string;
}
