import { Body, Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, SignInResultDto } from 'src/users/dto/users.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '42 oauth page 로 redirection' })
  @Get('oauthPage')
  @Redirect(
    'https://api.intra.42.fr/oauth/authorize?client_id=c44164aba01e6b4652fb6a4107e5188020a7e0c823b5013b2879b85ef7ea9abb&redirect_uri=http://localhost:3000/auth/signIn&response_type=code',
  )
  async getOatuhPage() {
    return 'getOauthPage';
  }

  @ApiOperation({ summary: '로그인' })
  @Get('signIn')
  async signIn(@Query('code') code: string): Promise<SignInResultDto | string> {
    const signInResult = await this.authService.signIn(code);

    return signInResult;
  }

  @ApiOperation({ summary: '회원가입' })
  @Post('signUp')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<string> {
    return await this.authService.signUp(createUserDto);
  }

  @ApiOperation({ summary: '닉네임 중복 확인' })
  @Get('isDuplicateNickname')
  async isDuplicateNickname(@Query() nickname: string): Promise<boolean> {
    return await this.authService.isDuplicateNickname(nickname);
  }

  @ApiOperation({ summary: 'todo: 이미지 업로드' })
  @Post('uploadImage')
  async uploadImage() {
    return 'todo: 이미지 업로드';
  }
}
