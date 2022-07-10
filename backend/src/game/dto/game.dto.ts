import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';

export class GetGameRoomsDto {
  @ApiProperty({ description: '게임방 id' })
  @IsNumber()
  gameId: number;

  @ApiProperty({ description: '게임방 제목' })
  @IsString()
  roomTitle: string;

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

export class CreateGameRoomDto {
  @ApiProperty({ description: '게임방 오너 유저 id' })
  @IsNumber()
  ownerId: number;

  @ApiProperty({ description: '게임방 제목' })
  @IsString()
  roomTitle: string;

  @ApiProperty({ description: '게임방 비밀번호' })
  @IsString()
  @IsOptional()
  password: string | null;
}

export class GameRoomPasswordDto extends PickType(CreateGameRoomDto, [
  'password',
]) {}

export class GetGameUsersDto {
  @ApiProperty({ description: '유저 닉네임' })
  @IsString()
  nickname: string;

  @ApiProperty({ description: '유저 프로필 이미지' })
  @IsString()
  avatar: string | null;

  @ApiProperty({ description: '게임방 유저의 승리 전적' })
  @IsNumber()
  winCount: number;

  @ApiProperty({ description: '게임방 유저의 패배 전적' })
  @IsNumber()
  loseCount: number;

  // @ApiProperty({ description: '게임방 유저가 첫번째 유저인지' })
  // @IsNumber()
  // isFirstPlayer: number;
}
