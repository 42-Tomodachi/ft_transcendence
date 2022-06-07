import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/users.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async getUserByEmail(email: string): Promise<User> {
    const ret = await this.userRepo.findOne({ where: { email } });
    return ret;
  }

  // async getUserBySecondAuthCode(secondAuthCode: number): Promise<User> {
  //   const ret = await this.userRepo.findOne({ where: { secondAuthCode } });
  //   return ret;
  // }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (await this.isDuplicateNickname(createUserDto.nickname)) {
      throw new BadRequestException('이미 존재하는 닉네임 입니다.');
    }

    const user = new User();
    user.nickname = createUserDto.nickname;
    user.avatar = createUserDto.avatar;
    user.email = createUserDto.email;
    user.secondAuth = createUserDto.secondAuth;
    user.secondAuthCode = createUserDto.secondAuthCode;

    return await this.userRepo.save(user);
  }

  async isDuplicateNickname(nickname: string): Promise<boolean> {
    const found = await this.userRepo.findOne({ where: { nickname } });
    if (found) {
      return true;
    }
    return false;
  }
}
