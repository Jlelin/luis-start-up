// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt'; // Importe o JwtModule

@Module({
  imports: [JwtModule], // Adicione o JwtModule aos imports
  providers: [UsersService, PrismaService],
  exports: [UsersService], // Exporte o UsersService se necessário
})
export class UsersModule {}
