import { PrismaService } from '../../prisma/prisma.service';
import { CreateEducationProgramDto } from './dto/create-education-program.dto';
import { UpdateEducationProgramDto } from './dto/update-education-program.dto';
type AuthUser = {
    userId?: string;
    id?: string;
    branchId?: string;
    role?: string;
};
export declare class EducationProgramsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getBranchId;
    list(user: AuthUser): Promise<({
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
    getOne(id: string, user: AuthUser): Promise<{
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
    create(dto: CreateEducationProgramDto, user: AuthUser): Promise<{
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
    update(id: string, dto: UpdateEducationProgramDto, user: AuthUser): Promise<{
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
export {};
