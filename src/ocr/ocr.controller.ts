import { Controller, Post, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ocr')
export class OcrController {
  constructor(
    private readonly ocrService: OcrService,
    private readonly prisma: PrismaService,
  ) {}

  @Post(':userId/upload')
  @UseInterceptors(FileInterceptor('file'))  // 'file' é o nome do campo no formulário
  async uploadAndExtractText(
    @Param('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ extractedText: string }> {
    // 1. Salva a imagem no banco de dados
    const invoice = await this.prisma.invoice.create({
      data: {
        userId: userId,
        image: file.buffer, // Salva a imagem como buffer no banco
      },
    });

    // 2. Extrai o texto da imagem recém-salva
    const extractedText = await this.ocrService.extractTextFromLatestInvoice(userId);

    // 3. Retorna o texto extraído
    return { extractedText };
  }
}
