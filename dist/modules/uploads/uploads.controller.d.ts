import type { Response } from 'express';
import { S3Service } from './s3.service';
export declare class UploadsController {
    private readonly s3;
    constructor(s3: S3Service);
    uploadReceipt(file?: Express.Multer.File): Promise<{
        key: string;
    }>;
    uploadShopItemImage(file?: Express.Multer.File): Promise<{
        key: string;
    }>;
    view(key: string): Promise<{
        key: string;
        url: string;
        expiresSec: number;
    }>;
    download(key: string): Promise<{
        key: string;
        url: string;
        expiresSec: number;
    }>;
    redirect(key: string, res: Response): Promise<void>;
}
