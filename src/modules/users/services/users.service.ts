import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByPhone(phone: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { phone },
    });
  }

  async createIfNotExistsByPhone(phone: string): Promise<UserEntity> {
    const existingUser = await this.findByPhone(phone);
    if (existingUser) {
      return existingUser;
    }

    const newUser = this.userRepository.create({
      phone,
      isPhoneVerified: false,
    });

    return this.userRepository.save(newUser);
  }

  async markPhoneVerified(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      isPhoneVerified: true,
    });
  }
}
