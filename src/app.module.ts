import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices/invoices.controller';
import { InvoicesService } from './invoices/invoices.service';
import { FileUploadService } from './invoices/file-upload.service'; // Serviço de upload de arquivos
import { ServeStaticModule } from '@nestjs/serve-static'; // Para servir arquivos estáticos
import { join } from 'path'; // Para resolver caminhos de arquivos
import { PrismaModule } from './prisma/prisma.module'; // Importando o PrismaModule
import { AuthModule } from './auth/auth.module'; // Importando o AuthModule
import { UsersModule } from './users/users.module'; // Importando o UsersModule
import { JwtModule } from '@nestjs/jwt'; // Importando o JwtModule para gestão de JWT
import { ConfigModule } from '@nestjs/config'; // Para carregar variáveis de ambiente
import { OcrService } from './ocr/ocr.service'; // Novo serviço OCR
import { OcrModule } from './ocr/ocr.module'; // Novo módulo OCR
import { HttpModule } from '@nestjs/axios'; // Importando o HttpModule para realizar requisições HTTP
import { GptService } from './gpt/gpt.service';
import { GptController } from './gpt/gpt.controller';

@Module({
  imports: [
    ConfigModule.forRoot(), // Carrega as variáveis de ambiente do arquivo .env
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule, // Adicionando o AuthModule
    UsersModule, // Adicionando o UsersModule
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret', // Define uma chave secreta para o JWT
      signOptions: { expiresIn: '1h' }, // Define o tempo de expiração do token (1 hora)
    }),
    OcrModule, 
    HttpModule, // Adicionando HttpModule para usar o axios
  ],
  controllers: [
    InvoicesController, // Adicionando o controlador de faturas
    GptController, // Adicionando o controlador para o GPT-1.3B
  ],
  providers: [
    InvoicesService,
    FileUploadService, // Serviço para manipulação de arquivos
    OcrService, 
    GptService, // Serviço que interage com o modelo GPT-1.3B
  ],
})
export class AppModule {}
