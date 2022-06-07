import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class UserDataDto {
  @ApiProperty({ description: '아바타' })
  @IsString()
  avatar: string;

  @ApiProperty({ description: '이메일' })
  @IsEmail()
  email: string;

  @IsBoolean()
  secondAuth: boolean;

  @IsString()
  secondAuthCode: number;
}

export class SignInResultDto extends UserDataDto {
  @ApiProperty({ description: '42api accessToken' })
  @IsString()
  accessToken: string;

  @ApiProperty({ description: '회원가입 여부' })
  @IsBoolean()
  isSignedUp: boolean;
}

export class CreateUserDto extends UserDataDto {
  @ApiProperty({ description: '닉네임' })
  @IsString()
  nickname: string;
}