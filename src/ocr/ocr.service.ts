import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Serviço Prisma para acessar o banco de dados
import * as Tesseract from 'tesseract.js'; // Biblioteca OCR para extração de texto

@Injectable()
export class OcrService {
  constructor(private prisma: PrismaService) {}

  // Função para buscar a última fatura e extrair texto (a última fatura registrada para um usuário específico)
  async extractTextFromLatestInvoice(userId: number): Promise<string> {
    // 1. Busca a última fatura registrada para o usuário no banco de dados
    const invoice = await this.prisma.invoice.findFirst({
      where: { user: { id: userId } }, // Filtra pela fatura do usuário usando o id do usuário
      orderBy: { createdAt: 'desc' }, // Ordena pela data de criação (última fatura registrada)
    });

    if (!invoice) {
      throw new Error('Fatura não encontrada para o usuário!');
    }

    // 2. Processa a imagem (supondo que o campo 'image' seja do tipo Bytes)
    const imageBuffer = Buffer.from(invoice.image);

    try {
      // 3. Usa Tesseract para extrair o texto da imagem
      const result = await Tesseract.recognize(imageBuffer, 'eng'); // Suporta múltiplos idiomas
      const extractedText = result.data.text;

      // 4. Salva o texto extraído no banco, associando com a fatura e o usuário
      await this.prisma.extractedText.create({
        data: {
          text: extractedText,
          invoiceId: invoice.id, // Relaciona o texto extraído à fatura
          userId: invoice.userId, // Relaciona ao usuário da fatura
        },
      });

      // 5. Retorna o texto extraído
      return extractedText;
    } catch (error) {
      console.error('Erro ao processar OCR:', error);
      throw new Error('Falha ao extrair texto da imagem!');
    }
  }
}
