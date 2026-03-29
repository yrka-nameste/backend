import { BadRequestException, Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';

@Injectable()
export class UploadsService {
  constructor(private readonly s3: S3Service) {}

  async uploadReceipt(file: Express.Multer.File) {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const result = await this.s3.uploadBuffer({
      buffer: file.buffer,
      contentType: file.mimetype,
      originalName: file.originalname,
      folder: 'receipts',
    });

    return result; // { key, url }
  }
}