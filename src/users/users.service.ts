import { InjectRepository } from '@nestjs/typeorm';
import User from './user.entity';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async getAllUsers() {
    const users = await this.usersRepository.find();
    return users;
  }
  async getUserById(id: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      const {
        name,
        twoFactorAuthenticationSecretEnabledAt,
        isTwoFactorAuthenticationEnabled,
        id,
      } = user;
      return {
        id,
        name,
        twoFactorAuthenticationSecretEnabledAt,
        isTwoFactorAuthenticationEnabled,
      };
    }
    throw new NotFoundException('Could not find the user');
  }

  async createUser(newUser: CreateUserDto) {
    const user = this.usersRepository.create(newUser);

    await this.usersRepository.save({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
    });
    const {
      name,
      twoFactorAuthenticationSecretEnabledAt,
      isTwoFactorAuthenticationEnabled,
    } = user;

    return {
      name,
      twoFactorAuthenticationSecretEnabledAt,
      isTwoFactorAuthenticationEnabled,
    };
  }

  async deleteUserById(id: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!user) return null;
    await this.usersRepository.remove(user);
    return id;
  }
  async findUserById(userId: number) {
    return await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });
  }
  async findUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: {
        email: email,
      },
    });
  }
  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    user.twoFactorAuthenticationSecret = secret;
    user.isTwoFactorAuthenticationEnabled = true;
    user.twoFactorAuthenticationSecretEnabledAt = Date();
    await this.usersRepository.save(user);
  }
  async turnOnTwoFactorAuthentication(userId: number) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    user.isTwoFactorAuthenticationEnabled = true;
    user.twoFactorAuthenticationSecretEnabledAt = Date();
    await this.usersRepository.save(user);
  }

  async turnOffTwoFactorAuthentication(userId: number) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    user.isTwoFactorAuthenticationEnabled = false;
    user.twoFactorAuthenticationSecretEnabledAt = null;
    await this.usersRepository.save(user);
  }
}
