import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
  Redirect,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  EmailDto,
  NicknameDto,
  UpdateUserDto,
  UserProfileDto,
} from '../users/dto/users.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { IsSignedUpDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: '[test for backend] 42 oauth page 로 redirection' })
  @Get('oauthPage')
  @Redirect(
    'https://api.intra.42.fr/oauth/authorize?client_id=c44164aba01e6b4652fb6a4107e5188020a7e0c823b5013b2879b85ef7ea9abb&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code',
  )
  async getOatuhPage() {
    return 'getOauthPage';
  }

  // @ApiOperation({ summary: '[test for backend] issue a fresh JWT' })
  // @Get('issueJwt/:id')
  // async getJwt(@Param('id', ParseIntPipe) id: number): Promise<string> {
  //   return this.authService.issueJwt(id);
  // }

  @ApiOperation({
    summary: 'kankim✅ 유저의 회원가입 여부 확인',
  })
  @Post('isSignedUp')
  async isSignedUp(@Body('code') code: string): Promise<IsSignedUpDto> {
    return await this.authService.isSignedUp(code);
  }

  // @ApiOperation({ summary: 'kankim✅ 회원가입' })
  // @Post('signUp')
  // async signUp(@Body() updateUserdto: UpdateUserDto): Promise<IsSignedUpDto> {
  //   return await this.authService.signUp(updateUserdto);
  // }

  @ApiOperation({ summary: 'kankim✅ 닉네임 중복 확인' })
  @Post('isDuplicateNickname')
  async isDuplicateNickname(
    @Body() nicknameDto: NicknameDto,
  ): Promise<boolean> {
    return await this.authService.isDuplicateNickname(nicknameDto.nickname);
  }

  @ApiOperation({ summary: ' 2차 인증 설정' })
  @Post('/enableSecondAuth/:id')
  async enableSecondAuth(
    @Param('id', ParseIntPipe) id: number,
    @Body() emailDto: EmailDto,
  ): Promise<void> {
    this.authService.enableSecondAuth(id, emailDto.email);
  }

  @ApiOperation({ summary: ' 2차 인증 해제' })
  @Post('/disableSecondAuth/:id')
  async disableSecondAuth(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    this.authService.disableSecondAuth(id);
  }

  @ApiOperation({ summary: ' 2차 인증 이메일 발송' })
  @Get('/shootSecondAuth/:id')
  @UseGuards(AuthGuard())
  async shootSecAuth(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.authService.shootSecondAuth(id);
  }

  @ApiOperation({ summary: ' 2차 인증 번호 검증' })
  @Post('/verifySecondAuth/:id')
  async verifySecondAuth(
    @Param('id', ParseIntPipe) id: number,
    @Body('code') code: number,
  ): Promise<boolean> {
    return this.authService.verifySecondAuth(id, code);
  }
}
