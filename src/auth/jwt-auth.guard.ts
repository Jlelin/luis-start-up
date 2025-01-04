import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service'; // Importe o AuthService
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService, // Injetando o AuthService
    private readonly reflector: Reflector, // Para acessar metadados, se necessário
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Imprime no terminal o header de autorização
    console.log('Authorization Header:', authHeader);
    console.log('Tipo do authHeader:', typeof authHeader);
    console.log('Valor do authHeader:', authHeader);
    
    if (!authHeader || typeof authHeader !== 'string' || authHeader.trim() === '') {
      console.error('Authorization header missing or invalid');
      throw new UnauthorizedException('Authorization header missing or invalid');
    }

    // Log para verificar se o cabeçalho foi dividido corretamente
    const [type, token] = authHeader.split(' ');
    console.log('Tipo do Authorization:', type);
    console.log('Token extraído:', token);

    if (type !== 'Bearer' || !token) {
      console.error('Invalid token format');
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      // Verifica e decodifica o token
      const decoded = this.jwtService.verify(token);
      console.log('Token decodificado:', decoded); // Log do conteúdo do token decodificado
      request.user = decoded; // Armazena o usuário no request para uso futuro

      // Valida o usuário usando o payload do token (chama o método validateUser)
      const user = await this.authService.validateUser(decoded);
      if (!user) {
        console.error('Usuário não encontrado');
        throw new UnauthorizedException('User not found');
      }

      // Se o usuário for válido, o request continua com o usuário
      console.log('Usuário validado:', user); // Log do usuário validado
      request.user = user;
      return true;

    } catch (error) {
      console.error('Erro ao verificar o token:', error.message); // Log para erro ao verificar o token
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
