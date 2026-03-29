import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { S3Service } from './s3.service';

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('uploads')
export class UploadsController {
  constructor(private readonly s3: S3Service) {}

  // -------------------- RECEIPTS (оплаты) --------------------

  @Post('receipt')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('file is required');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    // сохраняем в папку receipts/*
    return this.s3.uploadBuffer({
      buffer: file.buffer,
      contentType: file.mimetype,
      originalName: file.originalname,
      folder: 'receipts',
    }); // { key }
  }

  // -------------------- SHOP ITEMS (товары) --------------------

  @Post('shop-item')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadShopItemImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('file is required');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    // сохраняем в папку shop-items/*
    return this.s3.uploadBuffer({
      buffer: file.buffer,
      contentType: file.mimetype,
      originalName: file.originalname,
      folder: 'shop-items',
    }); // { key }
  }

  // -------------------- VIEW / DOWNLOAD / REDIRECT --------------------

  @Get('view')
  async view(@Query('key') key: string) {
    if (!key?.trim()) throw new BadRequestException('key is required');
    return this.s3.getPresignedUrl(key, { inline: true });
  }

  @Get('download')
  async download(@Query('key') key: string) {
    if (!key?.trim()) throw new BadRequestException('key is required');
    return this.s3.getPresignedUrl(key, { inline: false });
  }

  @Get('redirect')
  async redirect(@Query('key') key: string, @Res() res: Response) {
    if (!key?.trim()) throw new BadRequestException('key is required');
    const { url } = await this.s3.getPresignedUrl(key, { inline: true });
    return res.redirect(url);
  }
}