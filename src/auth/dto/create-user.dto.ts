// src/auth/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string; // Campo name para o nome do usuário

  @IsEmail()
  email: string; // Campo email com validação de e-mail

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string; // Campo senha com validação de comprimento mínimo
}
