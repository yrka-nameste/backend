type UploadBufferArgs = {
    buffer: Buffer;
    contentType: string;
    originalName?: string;
    folder: string;
};
export declare class S3Service {
    private readonly bucket;
    private readonly client;
    constructor();
    private getExt;
    uploadBuffer(args: UploadBufferArgs): Promise<{
        key: string;
    }>;
    getPresignedUrl(key: string, opts?: {
        inline?: boolean;
        expiresSec?: number;
    }): Promise<{
        key: string;
        url: string;
        expiresSec: number;
    }>;
}
export {};
