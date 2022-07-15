import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class GameRoomProfileDto {
  @ApiProperty({ description: '게임방 id' })
  @IsNumber()
  gameId: number;

  @ApiProperty({ description: '게임방 오너 유저 id' })
  @IsNumber()
  ownerId: number;

  @ApiProperty({ description: '게임방 제목' })
  @IsString()
  roomTitle: string;

  @ApiProperty({ description: '게임 모드' })
  @IsString()
  gameMode: 'normal' | 'speed' | 'obstacle';

  @ApiProperty({ description: '게임방 인원수' })
  @IsNumber()
  playerCount: number;

  @ApiProperty({ description: '게임방 공개방인지 여부' })
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({ description: '게임방이 게임중인지 여부' })
  @IsBoolean()
  isStart: boolean;
}

export class CreateGameRoomDto extends PickType(GameRoomProfileDto, [
  'ownerId',
  'roomTitle',
  'gameMode',
]) {
  @ApiProperty({ description: '게임방 비밀번호' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  password: string | null;
}

export class GameRoomPasswordDto extends PickType(CreateGameRoomDto, [
  'password',
]) {}
