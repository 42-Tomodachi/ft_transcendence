import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { UpdateUserDto, UserProfileDto } from 'src/users/dto/users.dto';
import { User } from 'src/users/entities/users.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from '../emails/email.service';
import { IsDuplicateDto, IsSignedUpDto } from './dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { session } from 'passport';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    public readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private accessTokens: Map<number, string> = new Map<number, string>();

  async issueJwt(id: number): Promise<string> {
    const user = await this.usersService.getUserById(id);

    return this.jwtService.sign({
      id: user.id,
      email: user.email,
    });
  }

  async setLogon(user: User): Promise<string> {
    if (this.accessTokens[user.id]) {
      return this.accessTokens[user.id];
    }
    const jwt = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });
    this.accessTokens[user.id] = jwt;
    user.userStatus = 'on';
    await user.save();

    return jwt;
  }

  async getAccessToken(code: string): Promise<string> {
    const axiosResult = await axios({
      method: 'post',
      url: `https://api.intra.42.fr/oauth/token`,
      data: {
        grant_type: 'authorization_code',
        client_id:
          process.env.EC2_CLIENT_ID ||
          this.configService.get<string>('CLIENT_ID'),
        client_secret:
          process.env.EC2_CLIENT_SECRET ||
          this.configService.get<string>('CLIENT_SECRET'),
        redirect_uri:
          process.env.EC2_REDIRECT_URI ||
          this.configService.get<string>('REDIRECT_URI'),
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

  userToIsSignedUpDto(user: User, jwt: string): IsSignedUpDto {
    const isSignedUpDto = new IsSignedUpDto();

    isSignedUpDto.userId = user.id;
    isSignedUpDto.nickname = user.nickname;
    isSignedUpDto.email = user.email;
    isSignedUpDto.avatar = user.avatar;
    isSignedUpDto.isSecondAuthOn = user.isSecondAuthOn;
    isSignedUpDto.jwt = jwt;

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

      return this.userToIsSignedUpDto(
        createdUser,
        await this.setLogon(createdUser),
      );
    }

    return this.userToIsSignedUpDto(user, await this.setLogon(user));
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

    return this.userToIsSignedUpDto(updatedUser, this.accessTokens[user.id]);
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

  async isDuplicateNickname(nickname: string): Promise<IsDuplicateDto> {
    if (nickname.length < 2 || nickname.length > 8) {
      throw new BadRequestException('닉네임은 최소2자 최대 8자 입니다.');
    }

    return await this.usersService.isDuplicateNickname(nickname);
  }

  async logoutStatus(user: User, userId: number): Promise<void> {
    if (user.id !== userId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }

    user.userStatus = 'off';
    await user.save();
    this.accessTokens.delete(user.id);
  }

  async startSecondAuth(
    user: User,
    id: number,
    email: string,
  ): Promise<boolean> {
    if (user.id !== id) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    if (user === null) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    const code = Math.floor(Math.random() * 1000000);
    const salt = await bcrypt.genSalt();
    const hashedCode = await bcrypt.hash(code.toString(), salt);
    user.secondAuthEmail = email;
    user.secondAuthCode = hashedCode;

    await user.save();
    await this.emailService.sendEmail(email, code);
    return true;
  }

  async verifySecondAuth(
    user: User,
    id: number,
    code: string,
  ): Promise<boolean> {
    if (user.id !== id) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    if (user === null) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    if (await bcrypt.compare(code, user.secondAuthCode)) {
      user.secondAuthCode = '7777777';
      await user.save();
      return true;
    } else {
      return false;
    }
  }

  async enrollSecondAuth(user: User, id: number): Promise<void> {
    if (user.id !== id) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    if (user === undefined) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }
    if (user.isSecondAuthOn === true) {
      throw new BadRequestException('이미 등록된 유저입니다.');
    }
    if (user.secondAuthCode !== '7777777') {
      throw new BadRequestException('인증되지 않은 유저입니다.');
    }

    user.isSecondAuthOn = true;
    await user.save();
  }

  async disableSecondAuth(user: User, id: number): Promise<void> {
    if (user.id !== id) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    if (user === undefined) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    user.secondAuthEmail = null;
    user.secondAuthCode = null;
    user.isSecondAuthOn = false;
    await user.save();
  }

  async shootSecondAuth(users: User, id: number): Promise<boolean> {
    const user = await this.usersService.getUserById(id);
    if (users.id !== user.id)
      throw new BadRequestException('권한이 없는 유저입니다.');

    if (user === null) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }
    if (user.isSecondAuthOn === false) {
      throw new BadRequestException('2차 인증을 설정하지 않은 유저입니다.');
    }

    const code = Math.floor(Math.random() * 1000000);
    const salt = await bcrypt.genSalt();
    const hashedCode = await bcrypt.hash(code.toString(), salt);
    user.secondAuthCode = hashedCode;
    await user.save();

    await this.emailService.sendEmail(user.secondAuthEmail, code);
    return true;
  }
}
