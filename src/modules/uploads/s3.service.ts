import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type UploadBufferArgs = {
  buffer: Buffer;
  contentType: string;
  originalName?: string;
  folder: string; // 'receipts'
};

@Injectable()
export class S3Service {
  private readonly bucket: string;
  private readonly client: S3Client;

  constructor() {
    const endpoint = (process.env.S3_ENDPOINT ?? '').trim();
    const region = (process.env.S3_REGION ?? '').trim();
    const bucket = (process.env.S3_BUCKET ?? '').trim();

    const accessKeyId = (process.env.S3_ACCESS_KEY_ID ?? '').trim();
    const secretAccessKey = (process.env.S3_SECRET_ACCESS_KEY ?? '').trim();

    if (!endpoint) throw new Error('S3_ENDPOINT is required');
    if (!region) throw new Error('S3_REGION is required');
    if (!bucket) throw new Error('S3_BUCKET is required');
    if (!accessKeyId) throw new Error('S3_ACCESS_KEY_ID is required');
    if (!secretAccessKey) throw new Error('S3_SECRET_ACCESS_KEY is required');

    this.bucket = bucket;

    this.client = new S3Client({
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true, // важно для Backblaze B2 S3
    });
  }

  private getExt(originalName?: string, contentType?: string): string {
    const byName = originalName ? originalName.split('.').pop()?.toLowerCase() : undefined;
    if (byName && byName.length <= 6) return byName;

    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
    };
    return map[contentType ?? ''] ?? 'bin';
  }

  async uploadBuffer(args: UploadBufferArgs) {
    const { buffer, contentType, originalName, folder } = args;

    if (!buffer?.length) throw new BadRequestException('file buffer is required');
    if (!folder?.trim()) throw new BadRequestException('folder is required');

    const ext = this.getExt(originalName, contentType);
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const key = folder + '/' + date + '/' + randomUUID() + '.' + ext;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return { key };
  }

  async getPresignedUrl(
    key: string,
    opts?: { inline?: boolean; expiresSec?: number },
  ) {
    if (!key?.trim()) throw new BadRequestException('key is required');

    // чтобы не было 500 из-за несуществующего ключа
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch {
      throw new BadRequestException('Key not found: ' + key);
    }

    const expiresSec = opts?.expiresSec ?? 600;
    const inline = opts?.inline ?? true;

    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentDisposition: inline ? 'inline' : 'attachment',
    });

    const url = await getSignedUrl(this.client, cmd, { expiresIn: expiresSec });
    return { key, url, expiresSec };
  }
}