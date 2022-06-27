import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { UpdateUserDto, UserProfileDto } from 'src/users/dto/users.dto';
import { User } from 'src/users/entities/users.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from '../emails/email.service';
import { IsSignedUpDto } from './dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  // async issueJwt(id: number): Promise<string> {
  //   const user = await this.usersService.getUserById(id);

  //   return this.jwtService.sign({
  //     id: user.id,
  //     email: user.email,
  //   });
  // }

  async getAccessToken(code: string): Promise<string> {
    const axiosResult = await axios({
      method: 'post',
      url: `https://api.intra.42.fr/oauth/token`,
      data: {
        grant_type: 'authorization_code',
        client_id:
          'c44164aba01e6b4652fb6a4107e5188020a7e0c823b5013b2879b85ef7ea9abb',
        client_secret:
          'b3ee694a82c2014be143f7a31575cd6b15c3e7bf3fbf0ba7ca6de057e9f8673d',
        redirect_uri: 'http://localhost:3000/callback',
        code,
      },
    });

    return axiosResult.data.access_token;
  }

  makeRand6Num = (): number => {
    const randNum = Math.floor(Math.random() * 1000000);
    return randNum;
  };

  async getUserEmail(accessToken: string): Promise<string> {
    const axiosResult = await axios({
      method: 'GET',
      url: 'https://api.intra.42.fr/v2/me',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const { email } = axiosResult.data;
    return email;
  }

  userToIsSignedUpDto(user: User): IsSignedUpDto {
    const isSignedUpDto = new IsSignedUpDto();

    isSignedUpDto.id = user.id;
    isSignedUpDto.nickname = user.nickname;
    isSignedUpDto.email = user.email;
    isSignedUpDto.avatar = user.avatar;
    isSignedUpDto.isSecondAuthOn = user.isSecondAuthOn;
    isSignedUpDto.jwt = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });

    return isSignedUpDto;
  }

  async isSignedUp(code: string): Promise<IsSignedUpDto> {
    const accessToken = await this.getAccessToken(code);
    const userEmail = await this.getUserEmail(accessToken);

    const user = await this.usersService.getUserByEmail(userEmail);

    if (!user) {
      const createdUser = await this.usersService.createUser({
        email: userEmail,
      });

      return this.userToIsSignedUpDto(createdUser);
    }

    return this.userToIsSignedUpDto(user);
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<IsSignedUpDto> {
    const user = await this.userRepo.findOne({
      where: { id: updateUserDto.userId },
    });

    if (!user) {
      throw new BadRequestException('유저를 찾을 수 없습니다.');
    }

    user.nickname = updateUserDto.nickname || user.nickname;
    user.avatar = updateUserDto.avatar || user.avatar;
    const updatedUser = await this.userRepo.save(user);

    return this.userToIsSignedUpDto(updatedUser);
  }

  // async signUp(updateUserDto: UpdateUserDto): Promise<IsSignedUpDto> {
  //   if (
  //     updateUserDto.nickname &&
  //     (await this.isDuplicateNickname(updateUserDto.nickname))
  //   ) {
  //     throw new BadRequestException('중복된 닉네임 입니다.');
  //   }

  //   return await this.updateUser(updateUserDto);
  // }

  async isDuplicateNickname(nickname: string): Promise<boolean> {
    if (nickname.length < 2 || nickname.length > 8) {
      throw new BadRequestException('닉네임은 최소2자 최대 8자 입니다.');
    }

    return await this.usersService.isDuplicateNickname(nickname);
  }

  async enableSecondAuth(id: number, email: string): Promise<void> {
    const user = await this.usersService.getUserById(id);

    if (user === undefined) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    user.secondAuthEmail = email;
    user.isSecondAuthOn = true;
    await user.save();
  }

  async disableSecondAuth(id: number): Promise<void> {
    const user = await this.usersService.getUserById(id);

    if (user === undefined) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    user.isSecondAuthOn = false;
    await user.save();
  }

  async activateSecondAuth(user: User) {
    user.secondAuthCode = Math.floor(Math.random() * 1000000);
    await user.save();
  }

  async shootSecondAuth(id: number): Promise<boolean> {
    const user = await this.usersService.getUserById(id);

    if (user === null || user.isSecondAuthOn === false) {
      return false;
    }
    await this.activateSecondAuth(user);
    await this.emailService.sendEmail(
      user.secondAuthEmail,
      user.secondAuthCode,
    );
    return true;
  }

  async verifySecondAuth(id: number, code: number): Promise<boolean> {
    const user = await this.usersService.getUserById(id);

    if (user.secondAuthCode === code) {
      return true;
    } else {
      return false;
    }
  }
}
