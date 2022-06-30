import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class IsSignedUpDto {
  @ApiProperty({ description: 'id( DB키 )' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: '닉네임' })
  @IsString()
  @IsOptional()
  nickname: string | null;

  @ApiProperty({ description: '이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '유저 데이터' })
  @IsString()
  @IsOptional()
  avatar: string | null;

  @ApiProperty({ description: '2차 인증 여부 ' })
  @IsBoolean()
  isSecondAuthOn: boolean;

  @ApiProperty({ description: 'jwt' })
  @IsString()
  jwt: string;
}

export class CodeStringDto {
  @ApiProperty({ description: '문자열 코드' })
  @IsString()
  code: string;
}
