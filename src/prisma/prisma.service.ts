// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Endpoint da API Flask Python local
  private readonly pythonApiUrl = 'http://localhost:5000';  // URL do servidor Python

  // Método de inicialização da conexão do Prisma
  async onModuleInit() {
    await this.$connect();
  }

  // Método de destruição da conexão do Prisma
  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Função para se comunicar com a API do Flask Python (que hospeda o modelo GPT)
  async sendMessageToPython(prompt: string): Promise<any> {
    try {
      // Enviando uma requisição POST para o servidor Flask Python
      const response = await axios.post(this.pythonApiUrl, { prompt });
      return response.data; // Retorna os dados da resposta da API do Flask
    } catch (error) {
      console.error('Erro ao comunicar com o servidor Python:', error);
      throw new Error('Falha ao se comunicar com o servidor Python');
    }
  }

  // Função para buscar dados no banco (exemplo de como pode interagir com o Prisma)
  async getUserData(userId: number) {
    try {
      const userData = await this.user.findUnique({
        where: { id: userId },
      });
      return userData;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw new Error('Falha ao buscar dados do usuário');
    }
  }
}
