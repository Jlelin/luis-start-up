// src/prisma/prisma.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],  // PrismaService é o provider que irá fornecer a instância do Prisma
  exports: [PrismaService],    // Exporte o PrismaService para que outros módulos possam usá-lo
})
export class PrismaModule {}
