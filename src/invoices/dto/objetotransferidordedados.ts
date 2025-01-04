// src/invoices/dto/objetotransferidordedados.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Name of the invoice file', required: false })
  @IsOptional() // Permite que o nome seja opcional
  @IsString()
  name?: string; // Agora o nome é opcional

  @ApiProperty({ description: 'Description of the invoice', required: false })
  @IsOptional() // Permite que a descrição seja opcional
  @IsString()
  description?: string; // Agora a descrição é opcional

  @ApiProperty({ description: 'Image of the invoice in Buffer format', required: false })
  @IsOptional() // Permite que a imagem seja opcional
  image?: Buffer; // Agora a imagem é opcional

  @ApiProperty({ description: 'The date the invoice was created', required: false })
  @IsOptional() // Permite que o campo createdAt seja opcional
  createdAt?: Date; // O banco pode preencher automaticamente, então é opcional

  @ApiProperty({ description: 'ID of the user associated with the invoice', required: false })
  @IsOptional() // Permite que o userId seja opcional
  @IsInt() // Verifica se o valor é um número inteiro
  userId?: number; // Agora o userId é opcional
}
