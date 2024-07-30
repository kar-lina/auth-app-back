import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import User from './user.entity';
import { CreateUserDto } from './dto/users.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllUsers(): Promise<User[]> {
    const users = await this.usersService.getAllUsers();
    return users;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<Partial<User>> {
    const user = await this.usersService.getUserById(id);
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Partial<User>> {
    const newUser = await this.usersService.createUser(createUserDto);
    return newUser;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteUSerById(@Param('id') id: number): Promise<number> {
    return await this.usersService.deleteUserById(id);
  }
}
