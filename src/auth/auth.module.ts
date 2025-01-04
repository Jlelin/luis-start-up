import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module'; // Importando o UsersModule
import { JwtModule } from '@nestjs/jwt'; // Importando o módulo JWT
import { AuthController } from './auth.controller'; // Importando o AuthController
import { GptModule } from '../gpt/gpt.module'; // Importando o GptModule

@Module({
  imports: [
    UsersModule, 
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Coloque sua chave secreta aqui
      signOptions: {
        expiresIn: '1h', // Tempo de expiração do token, pode ser configurado conforme necessário
      },
    }),
    GptModule, // Adicionando o GptModule aos imports
  ],
  providers: [AuthService],
  controllers: [AuthController],  // Registrando o AuthController para expor as rotas
  exports: [AuthService], // Exportando AuthService para ser usado em outros módulos
})
export class AuthModule {}
