import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Express } from 'express';
import * as path from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = path.resolve(__dirname, '..', 'uploads'); // Diretório onde os arquivos podem ser salvos para referência

  constructor(private readonly prisma: PrismaService) {}

  // Método para fazer o upload do arquivo e salvar como bytes no banco de dados
  async uploadFile(file: Express.Multer.File, userId: number): Promise<string> {
    try {
      // Certifique-se de que o diretório de upload exista
      await fs.mkdir(this.uploadPath, { recursive: true });

      // Caminho para salvar uma cópia local do arquivo (opcional, para referência)
      const filePath = path.join(this.uploadPath, file.originalname);

      // Escreve o arquivo no sistema de arquivos para referência local (opcional)
      await fs.writeFile(filePath, file.buffer);

      console.log('Arquivo salvo localmente em:', filePath);

      // Agora salvamos o buffer da imagem diretamente no banco de dados com o relacionamento com o usuário
      const invoice = await this.prisma.invoice.create({
        data: {
          name: file.originalname, // Nome do arquivo
          image: file.buffer,      // Armazena o buffer diretamente no campo 'image'
          user: {
            connect: { id: userId }, // Conecta o relacionamento com o usuário
          },
        },
      });

      console.log('Imagem salva no banco de dados com sucesso.');

      // Retorna uma mensagem de sucesso
      return `Arquivo '${file.originalname}' salvo com sucesso e registrado no banco de dados.`;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw new Error('Erro ao fazer upload do arquivo');
    }
  }
}
