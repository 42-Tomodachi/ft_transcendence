import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserProfileDto {
  @ApiProperty({ description: '유저 id' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '유저 닉네임' })
  @IsString()
  @MinLength(2, { message: '닉네임은 최소 2글자로 입력해 주세요.' })
  @MaxLength(8, { message: '닉네임은 최대 8글자로 입력해 주세요.' })
  nickname: string;

  @ApiProperty({ description: '유저 아바타' })
  @IsString()
  avatar: string;

  @ApiProperty({ description: '유저 이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '일반게임 승리 카운트' })
  @IsNumber()
  winCount: number;

  @ApiProperty({ description: '일반게임 패배 카운트' })
  @IsNumber()
  loseCount: number;

  @ApiProperty({ description: '래더게임 승리 카운트' })
  @IsNumber()
  ladderWinCount: number;

  @ApiProperty({ description: '래임게임 패배 카운트' })
  @IsNumber()
  ladderLoseCount: number;

  @ApiProperty({ description: '유저 래더 레벨' })
  @IsNumber()
  ladderLevel: number;
}

export class NicknameDto extends PickType(UserProfileDto, ['nickname']) {}

export class EmailDto extends PickType(UserProfileDto, ['email']) {}

export class SimpleUserDto extends PickType(UserProfileDto, [
  'userId',
  'nickname',
]) {
  @ApiProperty({ description: '로그인 상태' })
  status: 'on' | 'off' | 'play';
}

export class UpdateUserDto extends PickType(UserProfileDto, [
  'userId',
  'avatar',
  'nickname',
]) {}

export class WinLoseCountDto extends PickType(UserProfileDto, [
  'userId',
  'winCount',
  'loseCount',
  'ladderWinCount',
  'ladderLoseCount',
  'ladderLevel',
]) {}

export class NumberDto {
  @ApiProperty({ description: '숫자' })
  @IsNumber()
  number: number;
}
