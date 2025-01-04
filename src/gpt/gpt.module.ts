import { Module } from '@nestjs/common';
import { GptService } from './gpt.service'; // Serviço que será exportado
import { GptController } from './gpt.controller'; // Controller que será registrado
import { PrismaModule } from '../prisma/prisma.module'; // Importando o PrismaModule
import { JwtModule } from '@nestjs/jwt'; // Importando o JwtModule para o JwtService

@Module({
  imports: [PrismaModule, JwtModule],  // Certifique-se de importar o PrismaModule aqui
  controllers: [GptController],  // Certificando-se de registrar o GptController aqui
  providers: [GptService],  // Registrando o GptService
  exports: [GptService],  // Exportando o GptService para outros módulos
})
export class GptModule {}
