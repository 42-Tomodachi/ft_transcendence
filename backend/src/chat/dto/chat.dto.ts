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

class ChatRoomBaseDto {
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

  @ApiProperty({ description: '채팅방 비밀번호' })
  @IsString()
  @IsOptional()
  password: string | null;
}

export class ChatRoomDto extends PickType(ChatRoomBaseDto, [
  'roomId',
  'title',
  'isPublic',
  'ownerId',
  'numberOfParticipants',
  'isDm',
]) {}

export class ChatRoomDataDto extends PickType(ChatRoomBaseDto, [
  'roomId',
  'title',
  'ownerId',
]) {}

export class SetChatRoomDto extends PickType(ChatRoomBaseDto, [
  'title',
  'password',
]) {}

export class RoomPasswordDto extends PickType(ChatRoomBaseDto, ['password']) {}

export class ChatRoomIdDto extends PickType(ChatRoomBaseDto, ['roomId']) {}

export class ChatRoomUserDto {
  @ApiProperty({ description: '유저 id' })
  userId: number;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: "역할 ['owner' | 'manager' | 'guest']" })
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

export class ChatContentDto extends PickType(CreateChatContentDto, [
  'isBroadcast',
  'message',
  'fromUser',
  'createdTime',
]) {
  @ApiProperty({
    description: '공지 메세지가 아닐 경우, 보낸이의 정보가 들어간다.',
  })
  @IsOptional()
  @ValidateNested()
  from?: ChatRoomUserDto & { avatar: string | null };
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

export class IsMutedDto {
  @ApiProperty({ description: 'Is he Muted?' })
  @IsBoolean()
  isMuted: boolean;
}

export class ChatParticipantProfile extends UserProfileDto {
  @ApiProperty({ description: '뮤트 여부' })
  isMuted: boolean;

  @ApiProperty({ description: '채팅 참여자 역할' })
  role: 'owner' | 'manager' | 'guest';
}
