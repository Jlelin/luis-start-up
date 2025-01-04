import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/objetotransferidordedados';
import { Invoice } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  // Método para criar a fatura associada a um usuário
  async create(createInvoiceDto: CreateInvoiceDto, imageBuffer: Buffer, userEmail: string): Promise<Invoice> {
    console.log('Iniciando a criação da fatura...');
    try {
      // Verifica se imageBuffer é um Buffer válido
      if (!(imageBuffer instanceof Buffer)) {
        console.error('Erro: O imageBuffer deve ser do tipo Buffer');
        throw new Error('O imageBuffer deve ser do tipo Buffer');
      }
      console.log('imageBuffer válido');

      // Busca o usuário pelo email
      console.log(`Buscando usuário com o email: ${userEmail}`);
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (!user) {
        console.error('Erro: Usuário não encontrado');
        throw new Error('Usuário não encontrado');
      }
      console.log('Usuário encontrado:', user);

      // Cria uma nova fatura no banco de dados associada ao usuário
      console.log('Criando fatura para o usuário...');
      const invoice = await this.prisma.invoice.create({
        data: {
          name: createInvoiceDto.name,
          description: createInvoiceDto.description,
          image: imageBuffer,
          userId: user.id, // Associa a fatura ao ID do usuário
        },
      });

      console.log('Fatura criada com sucesso:', invoice);
      return invoice;
    } catch (error) {
      console.error('Erro ao salvar a fatura:', error);
      throw new Error('Falha ao salvar a fatura');
    }
  }

  // Método para buscar todas as faturas de um usuário pelo email
  async findAllByUserEmail(email: string): Promise<any[]> {
    console.log(`Buscando faturas para o usuário com o email: ${email}`);
    try {
      // Busca o usuário pelo email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.error('Erro: Usuário não encontrado');
        throw new Error('Usuário não encontrado');
      }
      console.log('Usuário encontrado:', user);

      // Busca faturas associadas ao usuário
      const invoices = await this.prisma.invoice.findMany({
        where: { userId: user.id },
      });

      console.log(`Faturas encontradas para o usuário: ${invoices.length} faturas`);
      return invoices.map((invoice) => ({
        id: invoice.id,
        name: invoice.name,
        description: invoice.description,
        image: invoice.image ? Buffer.from(invoice.image).toString('base64') : null,
        createdAt: invoice.createdAt,
      }));
    } catch (error) {
      console.error('Erro ao buscar as faturas:', error);
      throw new Error('Falha ao buscar as faturas');
    }
  }

  // Método para buscar todas as faturas de um usuário pelo userId
  async findAllByUser(userId: number): Promise<any[]> {
    console.log(`Buscando faturas para o usuário com userId: ${userId}`);
    try {
      // Busca faturas associadas ao usuário
      const invoices = await this.prisma.invoice.findMany({
        where: { userId },
      });

      console.log(`Faturas encontradas para o usuário: ${invoices.length} faturas`);
      return invoices.map((invoice) => ({
        id: invoice.id,
        name: invoice.name,
        description: invoice.description,
        image: invoice.image ? Buffer.from(invoice.image).toString('base64') : null,
        createdAt: invoice.createdAt,
      }));
    } catch (error) {
      console.error('Erro ao buscar as faturas pelo userId:', error);
      throw new Error('Falha ao buscar as faturas pelo userId');
    }
  }

  // Método para buscar uma fatura pelo ID e verificar se pertence ao usuário
  async findOneById(id: number, userEmail: string): Promise<any> {
    console.log(`Buscando fatura com id: ${id}`);
    try {
      // Busca o usuário pelo email
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (!user) {
        console.error('Erro: Usuário não encontrado');
        throw new Error('Usuário não encontrado');
      }
      console.log('Usuário encontrado:', user);

      // Busca a fatura pelo id
      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!invoice) {
        console.error('Erro: Fatura não encontrada');
        throw new Error('Fatura não encontrada');
      }

      // Verifica se a fatura pertence ao usuário
      if (invoice.userId !== user.id) {
        console.error('Erro: A fatura não pertence ao usuário');
        throw new ForbiddenException('Acesso negado: você não pode acessar esta fatura');
      }

      console.log('Fatura encontrada e pertence ao usuário:', invoice);
      return {
        id: invoice.id,
        name: invoice.name,
        description: invoice.description,
        image: invoice.image ? Buffer.from(invoice.image).toString('base64') : null,
        createdAt: invoice.createdAt,
      };
    } catch (error) {
      console.error('Erro ao buscar a fatura pelo ID:', error);
      throw new Error('Falha ao buscar a fatura pelo ID');
    }
  }

  // Método para excluir uma fatura pelo id (somente se pertencer ao usuário)
  async remove(id: number, userEmail: string): Promise<void> {
    console.log(`Iniciando a exclusão da fatura com id: ${id}`);
    try {
      // Busca o usuário pelo email
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (!user) {
        console.error('Erro: Usuário não encontrado');
        throw new Error('Usuário não encontrado');
      }
      console.log('Usuário encontrado:', user);

      // Verifica se a fatura pertence ao usuário
      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!invoice) {
        console.error('Erro: Fatura não encontrada');
        throw new Error('Fatura não encontrada');
      }
      if (invoice.userId !== user.id) {
        console.error('Erro: A fatura não pertence ao usuário');
        throw new ForbiddenException('Acesso negado: você não pode excluir esta fatura');
      }

      console.log('Fatura pertence ao usuário, excluindo...');

      // Exclui a fatura
      await this.prisma.invoice.delete({
        where: { id },
      });

      console.log('Fatura excluída com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir a fatura:', error);
      throw new Error('Falha ao excluir a fatura');
    }
  }

  // Método para pesquisar faturas com base no texto extraído da fatura (usando ExtractedText)
  async searchInvoicesByExtractedText(userEmail: string, query: string): Promise<any[]> {
    console.log(`Buscando faturas para o usuário com o email: ${userEmail} que contenham o texto extraído: "${query}"`);

    try {
      // Busca o usuário pelo email
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (!user) {
        console.error('Erro: Usuário não encontrado');
        throw new Error('Usuário não encontrado');
      }
      console.log('Usuário encontrado:', user);

      // Busca textos extraídos da fatura associados ao usuário e que contenham o texto da query
      const extractedTexts = await this.prisma.extractedText.findMany({
        where: {
          userId: user.id,
          text: {
            contains: query,  // Pesquisa no campo de texto extraído
            mode: 'insensitive',  // Pesquisa case-insensitive
          },
        },
        include: {
          invoice: true,  // Inclui as informações da fatura relacionada
        },
      });

      console.log(`Textos extraídos encontrados: ${extractedTexts.length}`);

      return extractedTexts.map((extractedText) => ({
        invoiceId: extractedText.invoiceId,
        extractedText: extractedText.text,
        invoiceName: extractedText.invoice.name,
        invoiceDescription: extractedText.invoice.description,
        createdAt: extractedText.createdAt,
      }));
    } catch (error) {
      console.error('Erro ao buscar faturas pelo texto extraído:', error);
      throw new Error('Falha ao buscar faturas pelo texto extraído');
    }
  }
}
