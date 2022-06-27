import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  minLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: '유저 id' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '아바타' })
  @IsString()
  @IsOptional()
  avatar: string | null;

  @ApiProperty({ description: '닉네임' })
  @IsString()
  nickname: string;
}

export class EmailDto {
  @ApiProperty({ description: '이메일' })
  @IsEmail()
  email: string;
}

export class SimpleUserDto {
  @ApiProperty({ description: '유저 id' })
  id: number;

  @ApiProperty({ description: '닉네임' })
  nickname: string;
}

export class NicknameDto {
  @ApiProperty({ description: '닉네임' })
  @IsString()
  @MinLength(2, { message: '닉네임은 최소 2글자로 입력해 주세요.' })
  @MaxLength(8, { message: '닉네임은 최대 8글자로 입력해 주세요.' })
  nickname: string;
}

export class UserProfileDto {
  @ApiProperty({ description: '유저 id' })
  id: number;

  @ApiProperty({ description: '유저 닉네임' })
  nickname: string;

  @ApiProperty({ description: '유저 아바타' })
  avatar: string;

  @ApiProperty({ description: '유저 이메일' })
  email: string;

  @ApiProperty({ description: '일반게임 승리 카운트' })
  winCount: number;

  @ApiProperty({ description: '일반게임 패배 카운트' })
  loseCount: number;

  @ApiProperty({ description: '래더게임 승리 카운트' })
  ladderWinCount: number;

  @ApiProperty({ description: '래임게임 패배 카운트' })
  ladderLoseCount: number;

  @ApiProperty({ description: '유저 래더 레벨' })
  ladderLevel: number;
}

export class WinLoseCountDto {
  @ApiProperty({ description: '유저 id' })
  id: number;

  @ApiProperty({ description: '일반게임 승리 카운트' })
  winCount: number;

  @ApiProperty({ description: '일반게임 패배 카운트' })
  loseCount: number;

  @ApiProperty({ description: '래더게임 승리 카운트' })
  ladderWinCount: number;

  @ApiProperty({ description: '래임게임 패배 카운트' })
  ladderLoseCount: number;

  @ApiProperty({ description: '유저 래더 레벨' })
  ladderLevel: number;
}
