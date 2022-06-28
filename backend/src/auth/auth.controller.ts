import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Redirect,
  ParseIntPipe,
  UseGuards,
  Session,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  EmailDto,
  NicknameDto,
  NumberDto,
  UpdateUserDto,
  UserProfileDto,
} from '../users/dto/users.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { IsSignedUpDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: '[test for backend] 42 oauth page 로 redirection' })
  @Get('oauthPage')
  async getOatuhPage() {
    return (
      process.env.EC2_42OAUTH_PAGE ||
      this.authService.configService.get<string>('42OAUTH_PAGE')
    );
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

  @ApiOperation({ summary: '✅ 2차 인증 등록 시작' })
  @Post('/second_auth/:id')
  async startSecondAuth(
    @Param('id', ParseIntPipe) id: number,
    @Body() emailDto: EmailDto,
  ): Promise<boolean> {
    return this.authService.startSecondAuth(id, emailDto.email);
  }

  @ApiOperation({ summary: '✅ 2차 인증 번호 검증' })
  @Get('/second_auth_verify/:id')
  async verifySecondAuth(
    @Param('id', ParseIntPipe) id: number,
    @Query('code', ParseIntPipe) code: number,
  ): Promise<boolean> {
    return this.authService.verifySecondAuth(id, code);
  }

  @ApiOperation({ summary: '✅ 2차 인증 등록 완료' })
  @Get('/second_auth_enroll/:id')
  async enrollSecondAuth(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.authService.enrollSecondAuth(id);
  }

  @ApiOperation({ summary: '✅ 2차 인증 해제' })
  @Delete('/second_auth/:id')
  async disableSecondAuth(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    this.authService.disableSecondAuth(id);
  }

  @ApiOperation({ summary: '✅ 2차 인증 수행' })
  @Get('/second_auth/:id')
  @UseGuards(AuthGuard())
  async shootSecAuth(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.authService.shootSecondAuth(id);
  }
}
