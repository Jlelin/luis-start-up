// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt'; // Importando as dependências do Passport
import { JwtPayload } from './jwt-payload.interface'; // Interface para o payload do JWT
import { AuthService } from './auth.service'; // O serviço que gerencia a autenticação
import { PrismaService } from '../prisma/prisma.service'; // Importando o PrismaService para interagir com o banco de dados

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private prisma: PrismaService, // Usando o PrismaService
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET, // A chave secreta usada para assinar o JWT (substitua por uma chave segura)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrai o token do cabeçalho de autorização
    });
  }

  // Método responsável por verificar o payload do JWT e recuperar o usuário associado
  async validate(payload: JwtPayload) {
    const { email } = payload;
    
    // Busca o usuário no banco de dados utilizando o email do payload com o Prisma
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Retorna o usuário encontrado no banco de dados
    return user;
  }
}
