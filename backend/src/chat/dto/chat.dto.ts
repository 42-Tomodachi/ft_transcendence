import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PrimaryColumnCannotBeNullableError } from 'typeorm';

export class ChatRoomDataDto {
  @ApiProperty({ description: '채팅방 id' })
  id: number;

  @ApiProperty({ description: '채팅방 제목' })
  title: string;

  @ApiProperty({ description: '채팅방 소유자' })
  ownerId: number;
}

export class ChatRoomDto {
  @ApiProperty({ description: '채팅방 id' })
  id: number;

  @ApiProperty({ description: '채팅방 제목' })
  title: string;

  @ApiProperty({ description: '공개방 여부, (공개방: true, 비공개: false)' })
  isPublic: boolean;

  @ApiProperty({ description: '채팅방 소유자' })
  ownerId: number;

  @ApiProperty({ description: '채팅방 참여인원' })
  numberOfParticipants: number;

  @ApiProperty({ description: 'dm방 여부' })
  isDm: boolean;
}

export class CreateChatRoomDto {
  @ApiProperty({ description: '채팅방 제목' })
  @IsString()
  title: string;

  @ApiProperty({ description: '채팅방 비밀번호' })
  @IsString()
  @IsOptional()
  password: string | null;

  @ApiProperty({ description: 'dm방인지 여부' })
  @IsBoolean()
  isDm: boolean;
}

export class ChatRoomParticipantsDto {
  @ApiProperty({ description: '유저id( DB key )' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '유저 닉네임' })
  @IsString()
  nickname: string;

  // @ApiProperty({ description: '온라인인지 여부' })
  // @IsBoolean()
  // isOnline: boolean;

  // @ApiProperty({ description: '게임중인지 여부' })
  // @IsBoolean()
  // isGaming: boolean;

  @ApiProperty({ description: '친구인지 여부' })
  @IsBoolean()
  isFriend: boolean;
}

export class RoomPasswordDto {
  @ApiProperty({ description: '채팅방 비밀번호' })
  @IsString()
  @IsOptional()
  password: string | null;
}

export class ChatRoomIdDto {
  @ApiProperty({ description: '채팅방 id' })
  @IsNumber()
  @IsOptional()
  chatRoomId: number;
}

export class UpdateChatRoomDto {
  @ApiProperty({ description: '채팅방 제목' })
  @IsString()
  title: string;

  @ApiProperty({ description: '채팅방 비밀번호' })
  @IsString()
  @IsOptional()
  password: string | null;
}
