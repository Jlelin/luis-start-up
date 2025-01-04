// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; // Injetando o UsersService que usa Prisma
import { JwtPayload } from './jwt-payload.interface'; // Interface do payload do JWT
import { CreateUserDto } from './dto/create-user.dto'; // DTO para criar usuário
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'; // Biblioteca para criptografia de senhas

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService, // Injetando o UsersService que usa Prisma
    private readonly jwtService: JwtService, // Injetando o JwtService
  ) {}

  // Método para registrar um novo usuário
  async register(createUserDto: CreateUserDto): Promise<any> {
    const { email, password, name } = createUserDto;

    // Verifica se o usuário já existe no banco de dados com Prisma
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      throw new ConflictException('Usuário já existe');
    }

    // Criação de um novo usuário usando o Prisma (sem a necessidade de criptografar a senha aqui)
    const newUser = await this.usersService.create({
      name,
      email,
      password, // Envia a senha para o UsersService, que fará o hash
    });

    // Retorna uma mensagem e os dados do usuário criado (sem a senha)
    return {
      message: 'Usuário registrado com sucesso',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    };
  }

  // Método para realizar login e gerar o JWT
  async login(email: string, password: string): Promise<any> {
    console.log(email);

    // Verifica se o usuário existe com Prisma
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      console.log('Usuário não encontrado.');
      throw new UnauthorizedException('Credenciais inválidas');
    }

    console.log('Usuário encontrado, verificando a senha...');

    // Compara a senha fornecida com a senha armazenada (hash) no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log(`A senha fornecida é válida? ${isPasswordValid}`);

    // Se a senha for inválida, lança exceção
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    console.log('Senha válida. Gerando o token...');

    // Cria o payload
    const payload: JwtPayload = { email: user.email };

    // Gera o token JWT
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    console.log('Token gerado com sucesso:', token);

    // Retorna o token e informações
    return { access_token: token };
  }

  // Método para validar o token JWT e retornar o usuário
  async validateUser(payload: JwtPayload): Promise<any> {
    console.log('Validando o usuário com o payload:', payload);
    return this.usersService.findOneByEmail(payload.email);
  }
}
