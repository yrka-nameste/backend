import { EducationProgramsService } from './education-programs.service';
import { CreateEducationProgramDto } from './dto/create-education-program.dto';
import { UpdateEducationProgramDto } from './dto/update-education-program.dto';
export declare class EducationProgramsController {
    private readonly programs;
    constructor(programs: EducationProgramsService);
    list(req: any): Promise<({
        group: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            branchId: string;
            ageCategory: string | null;
            year: number | null;
            isActive: boolean;
        } | null;
    } & {
        description: string | null;
        id: string;
        groupId: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        isActive: boolean;
        lessonsCount: number;
    })[]>;
    getOne(id: string, req: any): Promise<{
        group: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            branchId: string;
            ageCategory: string | null;
            year: number | null;
            isActive: boolean;
        } | null;
    } & {
        description: string | null;
        id: string;
        groupId: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        isActive: boolean;
        lessonsCount: number;
    }>;
    create(dto: CreateEducationProgramDto, req: any): Promise<{
        group: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            branchId: string;
            ageCategory: string | null;
            year: number | null;
            isActive: boolean;
        } | null;
    } & {
        description: string | null;
        id: string;
        groupId: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        isActive: boolean;
        lessonsCount: number;
    }>;
    update(id: string, dto: UpdateEducationProgramDto, req: any): Promise<{
        group: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            branchId: string;
            ageCategory: string | null;
            year: number | null;
            isActive: boolean;
        } | null;
    } & {
        description: string | null;
        id: string;
        groupId: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branchId: string;
        isActive: boolean;
        lessonsCount: number;
    }>;
}
