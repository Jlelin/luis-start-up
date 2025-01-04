// src/users/users.service.ts
import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Serviço do Prisma
import * as bcrypt from 'bcrypt'; // Biblioteca para criptografia de senhas
import { CreateUserDto } from './dto/create-user.dto'; // DTO para criar usuário
import { UpdateUserDto } from './dto/update-user.dto'; // DTO para atualizar usuário
import { LoginDto } from './dto/login.dto'; // DTO para login
import { JwtService } from '@nestjs/jwt'; // Serviço de JWT para gerar tokens

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService, // Serviço do Prisma
    private jwtService: JwtService, // Serviço de JWT
  ) {}

  // Método para criar um novo usuário
  async create(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto; // Agora incluindo o nome do usuário

    // Verifica se o usuário já existe no banco de dados
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new ConflictException('Usuário com esse email já existe');
    }

    // Criptografa a senha antes de salvar no banco
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria um novo usuário no banco de dados com o nome também
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name, // Incluindo o nome no banco de dados
      },
    });

    return newUser;
  }

  // Método para buscar um usuário pelo email
  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Método para buscar um usuário pelo id
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  // Método para buscar todos os usuários
  async findAll() {
    return this.prisma.user.findMany(); // Busca todos os usuários no banco de dados
  }

  // Método para login
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Verifica se o usuário existe
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Verifica se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta');
    }

    // Gera o token JWT com o payload (informações do usuário)
    const payload = { email: user.email, sub: user.id }; // O payload contém o ID do usuário e o email
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

  // Método para atualizar um usuário
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  // Método para excluir um usuário
  async remove(id: number) {
    const user = await this.findOne(id);
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
