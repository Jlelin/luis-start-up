// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service'; // Serviço que gerencia autenticação
import { CreateUserDto } from './dto/create-user.dto'; // Importando o DTO

@Controller('auth') // Define que as rotas abaixo serão prefixadas com "/auth"
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Rota para registrar um novo usuário
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Código de status 201 - Criado
  async register(@Body() createUserDto: CreateUserDto) { // Agora recebe o DTO completo
    try {
      const user = await this.authService.register(createUserDto); // Passa o DTO para o método register
      return {
        message: 'Usuário registrado com sucesso',
        user, // Retorna o usuário criado
      };
    } catch (error) {
      return { message: error.message };
    }
  }

  // Rota para fazer login do usuário e gerar o token JWT
  @Post('login')
  @HttpCode(HttpStatus.OK) // Código de status 200 - OK
  async login(
    @Body('email') email: string,
    @Body('password') password: string
  ) {
    try {
      console.log(email);
      // Chama o serviço de login para validar as credenciais e gerar o token
      const result = await this.authService.login(email, password);

      // Retorna o token e as informações do usuário
      return {
        message: 'Login realizado com sucesso!',
        access_token: result.access_token, // Token JWT
        user: result.user, // Informações do usuário
      };
    } catch (error) {
      return { message: error.message };
    }
  }
}
