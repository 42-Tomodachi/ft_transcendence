import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmailDto, NicknameDto } from '../users/dto/users.dto';
import { AuthService } from './auth.service';
import { IsSignedUpDto, CodeStringDto, IsDuplicateDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  async isSignedUp(@Body() codeDto: CodeStringDto): Promise<IsSignedUpDto> {
    return await this.authService.isSignedUp(codeDto.code);
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
  ): Promise<IsDuplicateDto> {
    return await this.authService.isDuplicateNickname(nicknameDto.nickname);
  }

  @ApiOperation({ summary: '✅ 2차 인증 등록 시작' })
  @Post('/second_auth/:userId')
  async startSecondAuth(
    @Param('userId', ParseIntPipe) id: number,
    @Body() emailDto: EmailDto,
  ): Promise<boolean> {
    return await this.authService.startSecondAuth(id, emailDto.email);
  }

  @ApiOperation({ summary: '✅ 2차 인증 번호 검증' })
  @Get('/second_auth_verify/:userId')
  async verifySecondAuth(
    @Param('userId', ParseIntPipe) id: number,
    @Query('code') code: string,
  ): Promise<boolean> {
    return await this.authService.verifySecondAuth(id, code);
  }

  @ApiOperation({ summary: '✅ 2차 인증 등록 완료' })
  @Get('/second_auth_enroll/:userId')
  async enrollSecondAuth(
    @Param('userId', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.authService.enrollSecondAuth(id);
  }

  @ApiOperation({ summary: '✅ 2차 인증 해제' })
  @Delete('/second_auth/:userId')
  async disableSecondAuth(
    @Param('userId', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.authService.disableSecondAuth(id);
  }

  @ApiOperation({ summary: '✅ 2차 인증 수행' })
  @Get('/second_auth/:userId')
  // @UseGuards(AuthGuard())
  async shootSecAuth(
    @Param('userId', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return await this.authService.shootSecondAuth(id);
  }
}
