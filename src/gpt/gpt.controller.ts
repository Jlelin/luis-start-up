// src/gpt/gpt.controller.ts
import { Controller, Post, Body, Headers } from '@nestjs/common';
import { GptService } from './gpt.service';

@Controller('gpt')
export class GptController {
  // Tornando o tokenlogin público para ser acessado pelo AuthService

  constructor(
    private readonly gptService: GptService,
  ) {}

  @Post('generate')
  async generateText(
    @Body('prompt') prompt: string, 
    @Headers('authorization') token: string // Recebe o token diretamente do cabeçalho de autorização
  ): Promise<any> {
    try {
      console.log('Token recebido do cabeçalho:', token); // Log do token recebido no cabeçalho


      // Passando o token de login como parâmetro junto com os outros parâmetros para o método
      const generatedText = await this.gptService.generateText(prompt, token);
      console.log('Texto gerado:', generatedText); // Log do texto gerado

      return { generated_text: generatedText };
    } catch (error) {
      console.error('Erro ao gerar texto ou obter tokenLogin:', error);
      return { error: 'Erro ao gerar texto' };
    }
  }
}
