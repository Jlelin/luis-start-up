import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto'; // DTO para criação de usuário
import { UpdateUserDto } from './dto/update-user.dto'; // DTO para atualização de usuário

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Endpoint para criar um novo usuário
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  // Endpoint para listar todos os usuários
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  // Endpoint para buscar um usuário específico por ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(Number(id)); // Converte o id para número
  }

  // Endpoint para atualizar um usuário
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(Number(id), updateUserDto); // Converte o id para número
  }

  // Endpoint para excluir um usuário
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(Number(id)); // Converte o id para número
  }
}
