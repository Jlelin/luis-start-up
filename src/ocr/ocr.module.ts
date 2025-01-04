import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';
import { PrismaService } from '../prisma/prisma.service'; // Serviço Prisma para acesso ao banco

@Module({
  controllers: [OcrController],
  providers: [OcrService, PrismaService],
})
export class OcrModule {}
