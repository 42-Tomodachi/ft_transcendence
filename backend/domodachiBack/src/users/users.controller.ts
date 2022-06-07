import { Controller, Get, Param, Body, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { EmailService } from 'src/emails/email.service';
import { CreateUserDto } from './dto/users.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService) {}

  @Get('/email')
  async secondAuth(@Query("email") email: string) : Promise<boolean> {
    let user = await this.usersService.getUserByEmail(email);
    if ( user === null ) {
      return false;
    }
    await this.emailService.sendEmail(user.email, user.secondAuthCode);
    // await this.emailService.sendEmail('dudns0503@naver.com');
    return true;
    
  }

  @Post('/emailVerify')
  async checkVerity ( 
    @Query("email") email: string,
    @Body('code') code: number ) : Promise<boolean> {
      let user = await this.usersService.getUserByEmail(email);
      return (user.secondAuthCode === code);
  }

  @Post('/emailAuthSetup')
  async codeSetup(createUserDto: CreateUserDto) {
    if (!createUserDto.secondAuth)
    {
      console.log('이메일 2차 인증 설정');
      createUserDto.secondAuth = true;
    }
    else
    {
      console.log('이메일 2차 인증 설정 해제');
      createUserDto.secondAuth = false;
    }
  }

  @ApiOperation({ summary: '유저 목록 가져오기' })
  @Get('')
  async getUsers(): Promise<User[]> {
    const ret = await this.usersService.getUsers();
    return ret;
  }
}
