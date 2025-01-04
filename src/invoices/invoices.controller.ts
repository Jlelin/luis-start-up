import { 
  Controller, 
  Post, 
  Body, 
  UploadedFile, 
  UseInterceptors, 
  Param, 
  Delete, 
  Get, 
  BadRequestException, 
  UnauthorizedException, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateInvoiceDto } from './dto/objetotransferidordedados';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as Tesseract from 'tesseract.js'; // Bibliotéca OCR para extração de texto
import { PrismaService } from '../prisma/prisma.service'; // Certifique-se de importar o serviço do Prisma

@UseGuards(JwtAuthGuard) // Garante que o usuário esteja autenticado
@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly prisma: PrismaService, // Injeta o PrismaService
  ) {}

  // Rota para criar uma nova fatura associada ao usuário autenticado
  @ApiOperation({ summary: 'Create a new invoice with an image' })
  @ApiResponse({ status: 201, description: 'Invoice successfully created.' })
  @Post()
  @UseInterceptors(FileInterceptor('file')) // Intercepta o arquivo enviado
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req, // Dados do usuário autenticado
  ): Promise<any> {
    console.log('Iniciando a criação da fatura...');

    // Verificação do cabeçalho de autorização
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('Authorization Header is missing or empty');
      throw new UnauthorizedException('Authorization token is missing');
    }

    console.log('Authorization Header:', authHeader);

    // Verificando se o arquivo foi enviado
    if (!file) {
      console.error('Nenhum arquivo enviado');
      throw new BadRequestException('No file uploaded');
    }

    // Obtendo o email do usuário autenticado
    const userEmail = req.user.email; // Obtém o email do usuário autenticado
    console.log('Email do usuário autenticado:', userEmail);

    const imageBytes = file.buffer; // Converte o arquivo para Bytes
    console.log('Arquivo convertido para bytes com tamanho:', imageBytes.length);

    try {
      // Criação da fatura
      const invoice = await this.invoicesService.create(createInvoiceDto, imageBytes, userEmail); // Passando o email ao invés do userId
      console.log('Fatura criada com sucesso:', invoice);

      // Extração de texto da imagem usando OCR
      const extractedText = await this.extractTextFromImage(file.buffer);
      console.log('Texto extraído da imagem:', extractedText);

      // Salvar o texto extraído no banco de dados
      const extractedTextEntry = await this.prisma.extractedText.create({
        data: {
          text: extractedText,
          invoiceId: invoice.id,
          userId: req.user.id, // O usuário autenticado
        },
      });
      console.log('Texto extraído salvo com sucesso:', extractedTextEntry);

      // Retorna a fatura criada com sucesso e o usuário autenticado
      return {
        message: 'Fatura criada com sucesso!',
        invoice,
        extractedText, // Retorna o texto extraído junto com a fatura
        user: req.user, // Retorna o usuário autenticado junto com a fatura
      };
    } catch (error) {
      console.error('Erro ao criar fatura:', error);
      throw error;
    }
  }

  // Função para extrair texto da imagem utilizando OCR
  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(
        imageBuffer,
        'eng', // Idioma de reconhecimento
        {
          logger: (m) => console.log(m), // Log do progresso
        }
      )
      .then(({ data: { text } }) => {
        resolve(text); // Retorna o texto extraído
      })
      .catch((error) => {
        console.error('Erro ao realizar OCR:', error);
        reject('Erro ao realizar OCR');
      });
    });
  }

  // Rota para listar todas as faturas do usuário autenticado
  @ApiOperation({ summary: 'Get all invoices of the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of invoices.' })
  @Get()
  async findAll(@Request() req): Promise<any> {
    console.log('Buscando todas as faturas do usuário autenticado...');

    // Verificação do cabeçalho de autorização
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('Authorization Header is missing or empty');
      throw new UnauthorizedException('Authorization token is missing');
    }

    console.log('Authorization Header:', authHeader);

    // Obter o userEmail do usuário autenticado
    const userEmail = req.user.email; // Obtém o email do usuário autenticado
    console.log('Email do usuário autenticado:', userEmail);

    try {
      // Obtendo as faturas do usuário
      const invoices = await this.invoicesService.findAllByUser(userEmail); // Passando o email ao invés do userId
      console.log('Faturas encontradas para o usuário:', invoices);

      return {
        invoices: invoices.map((invoice) => ({
          id: invoice.id,
          name: invoice.name,
          description: invoice.description,
          image: invoice.image,
          createdAt: invoice.createdAt,
        })),
        user: req.user, // Retorna o usuário junto com as faturas
      };
    } catch (error) {
      console.error('Erro ao buscar faturas:', error);
      throw error;
    }
  }

  // Rota para excluir uma fatura pelo id (apenas se pertencer ao usuário autenticado)
  @ApiOperation({ summary: 'Delete an invoice by id' })
  @ApiResponse({ status: 200, description: 'Invoice successfully deleted.' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<any> {
    console.log('Iniciando a exclusão da fatura com id:', id);

    // Verificação do cabeçalho de autorização
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('Authorization Header is missing or empty');
      throw new UnauthorizedException('Authorization token is missing');
    }

    console.log('Authorization Header:', authHeader);

    // Obtendo o email do usuário autenticado
    const userEmail = req.user.email; // Email do usuário autenticado
    console.log('Email do usuário autenticado:', userEmail);

    try {
      // Verificando se a fatura pertence ao usuário antes de excluir
      const invoice = await this.invoicesService.findOneById(+id, userEmail); // Passando o email ao invés do userId

      // Verifica se a fatura existe e se pertence ao usuário
      if (invoice.userEmail !== userEmail) {
        console.error('Fatura não pertence ao usuário');
        throw new UnauthorizedException('You can only delete your own invoices');
      }

      // Excluindo a fatura
      await this.invoicesService.remove(+id, userEmail);
      console.log('Fatura excluída com sucesso.');

      return {
        message: 'Fatura excluída com sucesso!',
        user: req.user, // Retorna o usuário após a exclusão da fatura
      };
    } catch (error) {
      console.error('Erro ao excluir fatura:', error);
      throw error;
    }
  }
}
