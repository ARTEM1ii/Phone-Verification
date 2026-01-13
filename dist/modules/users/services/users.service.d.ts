import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<UserEntity>);
    findByPhone(phone: string): Promise<UserEntity | null>;
    createIfNotExistsByPhone(phone: string): Promise<UserEntity>;
    markPhoneVerified(userId: string): Promise<void>;
}
