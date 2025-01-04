import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'A senha deve ter pelo menos 6 caracteres, incluindo uma letra maiúscula, um número e um caractere especial',
  })
  password: string;

  @IsString()
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
  @Matches(/^[a-zA-Z ]*$/, { message: 'O nome deve conter apenas letras e espaços' })
  name: string;
}
