import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatContents } from './entities/chatContents.entity';
import { ChatParticipant } from './entities/chatParticipant.entity';
import { ChattingRoom } from './entities/chattingRoom.entity';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // todo: 로그인한 유저의 권한 확인해야함, @UseGuard 사용하고 @req() 로 받아서 req.user 이렇게 사용하면 될까?

  // 채팅방 목록 가져오기
  @ApiOperation({ summary: '채팅방 목록 가져오기' })
  @Get('')
  async getChatRooms(): Promise<ChattingRoom[]> {
    return [];
  }

  // 채팅방 유저 목록 가져오기
  @ApiOperation({ summary: '채팅방 유저 목록 가져오기' })
  @Get(':roomId/participants')
  async getChatParticipants(
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<ChatParticipant[]> {
    return [];
  }

  // 채팅 내용 가져오기
  @ApiOperation({ summary: '채팅 내용 가져오기' })
  @Get(':roomId/contents')
  async getChatContents(
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<ChatContents[]> {
    return [];
  }

  // 채팅 방 제목 수정
  @ApiOperation({ summary: '채팅 방 제목 수정' })
  @Patch(':roomId/title')
  async updateRoomTitle(
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<void> {
    const a = 'updateRoomTitle';
  }

  // 채팅 방 비밀번호 수정
  @ApiOperation({ summary: '채팅 방 비밀번호 수정' })
  @Patch(':roomId/password')
  async updateRoomPassword(
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<void> {
    const a = 'updateRoomPassword';
  }

  // 채팅 방 비밀번호 제거
  @ApiOperation({ summary: '채팅 방 비밀번호 제거' })
  @Delete(':roomId/password')
  async removeRoomPassword(
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<void> {
    const a = 'removeRoomPassword';
  }

  // 게스트를 관리자로 설정하기(오너, 관리자)
  @ApiOperation({
    summary: '게스트를 관리자로 설정하기(오너, 관리자만 가능)',
  })
  @Patch(':roomId/giveManager')
  async giveManager(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('targetUserId', ParseIntPipe) targetUserId: number,
  ): Promise<void> {
    const a = 'giveManager';
  }

  // 관리자를 게스트로 설정하기(오너만)
  @ApiOperation({ summary: '관리자를 게스트로 설정하기(오너만)' })
  @Patch(':roomId/revokeManager')
  async revokeManager(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('targetUserId', ParseIntPipe) targetUserId: number,
  ): Promise<void> {
    const a = 'revokeManager';
  }

  // 강퇴
  @ApiOperation({ summary: '강퇴 시키기' })
  @Patch(':roomId/ban')
  async banParticipant(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('targetUserId', ParseIntPipe) targetUserId: number,
  ): Promise<void> {
    const a = 'banParticipant';
  }

  // 음소거
  @ApiOperation({ summary: '음소거 시키기' })
  @Patch(':roomId/mute')
  async muteParticipant(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('targetUserId', ParseIntPipe) targetUserId: number,
  ): Promise<void> {
    const a = 'muteParticipant';
  }
  // 인터페이스를 통해 게임 할 수 있도록 초대
  // 인터페이스를 통해 다른 유저의 프로필 보기
}
