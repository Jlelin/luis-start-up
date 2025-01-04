import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';  // Importando o PrismaService
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class GptService {
  private readonly pythonApiUrl = 'http://localhost:5000/generate'; // URL correta para a rota '/generate' do Flask
  public tokenlogin: string; 
  public email: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, // Injetando o JwtService
  ) {}

  // Função para gerar texto com dados do banco e enviar apenas o prompt
  async generateText(prompt: string, token: string): Promise<string> {
    console.log(this.tokenlogin);
    try {
      console.log(`Iniciando geração de texto com o prompt: ${prompt}`);


      // Imprimir o email no terminal
      console.log(`Email do usuário: ${this.email}`);

      if (!this.email) {
        throw new UnauthorizedException('Usuário não autorizado');
      }

      // Consultar o usuário no banco de dados com base no email
      const user = await this.prisma.user.findUnique({ where: { email: this.email } });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      // Consultar todos os registros do modelo ExtractedText para o usuário
      const extractedTexts = await this.prisma.extractedText.findMany({
        where: { userId: user.id },
        include: { invoice: true, user: true }, // Incluir dados relacionados de fatura e usuário
      });

      console.log(`Registros encontrados para o usuário ${user.id}:`, extractedTexts);

      // Gerar um texto com os registros extraídos
      let extractedTextData = '';
      extractedTexts.forEach((item) => {
        extractedTextData += `\nTexto: ${item.text} - Fatura ID: ${item.invoiceId} - Criado em: ${item.createdAt}`;
      });

      console.log('Texto extraído formatado:', extractedTextData);

      // Ajustar o prompt com as informações dos registros
      let augmentedPrompt = `${prompt}\nAqui estão os registros extraídos: ${extractedTextData}`;

      // Validar o tokenLogin antes de prosseguir
      try {
        const decodedLogin = this.jwtService.verify(this.tokenlogin); // Verifica a validade do token de login
        console.log('Token de login verificado com sucesso:', decodedLogin);
      } catch (error) {
        throw new UnauthorizedException('Token de login inválido');
      }

      // Enviar o prompt e os dados do usuário para o Flask
      const response = await axios.post(`${this.pythonApiUrl}?email=${encodeURIComponent(this.email)}`, {
        prompt: augmentedPrompt, // Enviar apenas o prompt
      });
      

      console.log(`Resposta do Flask recebida: ${response.data.generated_text}`);

      // Exibir a mensagem de sucesso no terminal após o envio
      console.log(`Email enviado com sucesso para o endereço: ${user.email}`);

      return response.data.generated_text;
    } catch (error) {
      console.error('Erro ao gerar texto:', error);
      throw new Error('Erro ao gerar texto');
    }
  }


}
