import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common'; // Importe o Logger

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do logger para capturar o nível de debug
  const logger = new Logger('Bootstrap'); // Nome para identificar os logs dessa parte

  // Habilita o CORS para aceitar requisições do frontend nas portas 3001 e 5000
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:5000'], // URLs permitidas para CORS
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Aplica o ValidationPipe globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Isso transforma os dados automaticamente para o tipo correto (por exemplo, convertendo strings em números)
      whitelist: true, // Remove propriedades não definidas no DTO
    }),
  );

  // Exemplo de log de debug
  logger.debug('Configuração do CORS e do ValidationPipe aplicada com sucesso.');

  // O servidor agora vai ouvir na porta 3000
  await app.listen(3000);  // Verifique se o backend está rodando na porta 3000

  // Log de sucesso ao iniciar o servidor
  logger.debug('Servidor iniciado na porta 3000');
}

bootstrap();
