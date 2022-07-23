import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { ChatRoomUserDto } from './chatParticipant.dto';

export class FromWhomDto extends PickType(ChatRoomUserDto, ['nickname']) {
  @ApiProperty({ description: '유저 프로필 사진' })
  avatar: string | null;
}

export class ChatContentDto {
  @ApiProperty({ description: '공지 메시지인지 여부' })
  @IsBoolean()
  isBroadcast: boolean;

  @ApiProperty({
    description: '공지 메세지가 아닐 경우, 보낸이의 정보가 들어간다.',
  })
  @IsOptional()
  @ValidateNested()
  from?: FromWhomDto;

  @ApiProperty({ description: '채팅 내용' })
  @IsString()
  message: string;

  @ApiProperty({ description: '자신이 보낸 메세지인지 여부' })
  @IsBoolean()
  isMyMessage?: boolean;

  @ApiProperty({
    description:
      '만들어진 시간, 요청 시 보낼 필요 없음, 리스폰스로 줄 때만 넘어갈 예정',
  })
  @IsDateString()
  createdTime: string;
}

export class CreateChatContentDto extends PickType(ChatContentDto, [
  'isBroadcast',
  'message',
]) {}

export class MessageDto extends PickType(ChatContentDto, ['message']) {}
