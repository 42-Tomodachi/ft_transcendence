import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  CreateUserDto,
  SignInResultDto,
  UserDataDto,
} from 'src/users/dto/users.dto';
import { User } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

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
        redirect_uri: 'http://localhost:3000/auth/signIn',
        code,
      },
    });

    return axiosResult.data.access_token;
  }

  async getUserData(accessToken: string): Promise<UserDataDto> {
    const axiosResult = await axios({
      method: 'GET',
      url: 'https://api.intra.42.fr/v2/me',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const { email, login, image_url } = axiosResult.data;
    const userData: UserDataDto = {
      username: login,
      avatar: image_url,
      email,
      secondAuth: false,
    };
    return userData;
  }

  async signIn(code: string): Promise<SignInResultDto> {
    const accessToken = await this.getAccessToken(code);
    const userData = await this.getUserData(accessToken);

    const user = await this.usersService.getUserByEmail(userData.email);
    if (!user) {
      return {
        ...userData,
        accessToken,
        isSigned: false,
      };
    }

    return {
      ...userData,
      accessToken,
      isSigned: true,
    };
  }

  async signUp(createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.createUser(createUserDto);
  }

  async isDuplicateNickname(nickname: string): Promise<boolean> {
    return await this.usersService.isDuplicateNickname(nickname);
  }
}
