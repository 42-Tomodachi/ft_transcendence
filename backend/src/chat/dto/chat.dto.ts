import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { UserProfileDto } from 'src/users/dto/users.dto';
import { PrimaryColumnCannotBeNullableError } from 'typeorm';

export class ChatRoomDto {
  @ApiProperty({ description: '채팅방 id' })
  roomId: number;

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

export class ChatRoomDataDto extends PickType(ChatRoomDto, [
  'roomId',
  'title',
  'ownerId',
]) {}

export class CreateChatRoomDto extends PickType(ChatRoomDto, [
  'title',
  'isDm',
]) {
  @ApiProperty({ description: '채팅방 비밀번호' })
  @IsString()
  @IsOptional()
  password: string | null;
}

// export class ChatRoomParticipantsDto {
//   @ApiProperty({ description: '유저id( DB key )' })
//   @IsNumber()
//   userId: number;

//   @ApiProperty({ description: '유저 닉네임' })
//   @IsString()
//   nickname: string;

//   // @ApiProperty({ description: '온라인인지 여부' })
//   // @IsBoolean()
//   // isOnline: boolean;

//   // @ApiProperty({ description: '게임중인지 여부' })
//   // @IsBoolean()
//   // isGaming: boolean;

//   @ApiProperty({ description: '친구인지 여부' })
//   @IsBoolean()
//   isFriend: boolean;
// }

export class RoomPasswordDto {
  @ApiProperty({ description: '채팅방 비밀번호' })
  @IsString()
  @IsOptional()
  password: string | null;
}

export class ChatRoomIdDto extends PickType(ChatRoomDto, ['roomId']) {}

export class UpdateChatRoomDto extends PickType(ChatRoomDto, ['title']) {
  @ApiProperty({ description: '채팅방 비밀번호' })
  @IsString()
  @IsOptional()
  password: string | null;
}

export class ChatRoomUserDto {
  @ApiProperty({ description: '유저 id' })
  userId: number;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: '역할' })
  role: 'owner' | 'manager' | 'guest';
}

export class CreateChatContentDto {
  @ApiProperty({ description: '공지 메시지인지 여부' })
  @IsBoolean()
  isBroadcast: boolean;

  @ApiProperty({
    description: '공지 메세지가 아닐 경우, 보낸이의 정보가 들어간다.',
  })
  @IsOptional()
  @ValidateNested()
  from?: ChatRoomUserDto;

  @ApiProperty({ description: '채팅 내용' })
  @IsString()
  message: string;

  @ApiProperty({ description: '자신이 보낸 메세지인지 여부' })
  @IsBoolean()
  fromUser: boolean;

  @ApiProperty({
    description:
      '만들어진 시간, 요청 시 보낼 필요 없음, 리스폰스로 줄 때만 넘어갈 예정',
  })
  @IsDateString()
  createdTime?: string;
}

export class ParticipantRoleDto {
  @ApiProperty({ description: '채팅 참여자 역할' })
  @IsString()
  role: 'owner' | 'manager' | 'guest';
}

export class BooleanDto {
  @ApiProperty({ description: 'true or false' })
  @IsBoolean()
  boolean: boolean;
}

export class ChatParticipantProfile extends UserProfileDto {
  @ApiProperty({ description: '뮤트 여부' })
  isMuted: boolean;

  @ApiProperty({ description: '채팅 참여자 역할' })
  role: 'owner' | 'manager' | 'guest';
}
