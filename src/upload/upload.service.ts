import { Injectable, BadRequestException } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { extname, join } from 'path';
import { nanoid } from 'nanoid';

export interface UploadedImageFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  [key: string]: any;
}

@Injectable()
export class UploadService {
  private readonly uploadDir = 'uploads';

  async saveImage(file: UploadedImageFile): Promise<string> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('仅允许上传图片文件');
    }

    await mkdir(this.uploadDir, { recursive: true });

    const ext = extname(file.originalname) || '.jpg';
    const filename = `${nanoid()}${ext}`;
    const filePath = join(this.uploadDir, filename);

    await writeFile(filePath, file.buffer);

    return `/uploads/${filename}`;
  }
}
