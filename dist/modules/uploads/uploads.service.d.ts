import { S3Service } from './s3.service';
export declare class UploadsService {
    private readonly s3;
    constructor(s3: S3Service);
    uploadReceipt(file: Express.Multer.File): Promise<{
        key: string;
    }>;
}
