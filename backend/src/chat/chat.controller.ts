import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import {
  ChatRoomParticipantsDto,
  ChatRoomDataDto,
  CreateChatRoomDto,
  RoomPasswordDto,
  ChatRoomIdDto,
  UpdateChatRoomDto,
  CreateChatContentDto,
  BooleanDto,
  ParticipantRoleDto,
} from './dto/chat.dto';
import { ChatContents } from './entities/chatContents.entity';
import { ChatParticipant } from './entities/chatParticipant.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('chats')
@Controller('chats')
// @UseGuards(AuthGuard()) // todo: 모든 api 구현 후 조건별로 api 적용할 것
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'kankim✅ 채팅방 목록 가져오기' })
  @Get('')
  async getChatRooms(): Promise<ChatRoomDataDto[]> {
    const chatRooms = this.chatService.getChatRooms();

    return chatRooms;
  }

  @ApiOperation({ summary: 'kankim✅ 참여중인 채팅방 목록 가져오기' })
  @Get('/users/:userId')
  async getParticipatingChatRooms(
    @Param('userId') userId: number,
  ): Promise<ChatRoomDataDto[]> {
    const chatRooms = this.chatService.getParticipatingChatRooms(userId);

    return chatRooms;
  }

  @ApiOperation({ summary: 'kankim✅ 채팅방 만들기' })
  @Post(':userId')
  async createChatRoom(
    @Param('userId') userId: number,
    @Body() createChatRoomDto: CreateChatRoomDto,
  ): Promise<ChatRoomDataDto> {
    const chatRoom = await this.chatService.createChatRoom(
      userId,
      createChatRoomDto,
    );

    return chatRoom;
  }

  @ApiOperation({ summary: '채팅방 참여자 목록 가져오기' })
  @Get('/:roomId/participants')
  async getChatParticipants(
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<ChatParticipant[]> {
    return this.chatService.getRoomParticipants(roomId);
  }

  @ApiOperation({ summary: 'kankim✅ 채팅방 입장하기' })
  @Post(':roomId/users/:userId')
  async enterChatRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() roomPasswordDto: RoomPasswordDto,
  ): Promise<ChatRoomIdDto> {
    return await this.chatService.enterChatRoom(
      roomId,
      userId,
      roomPasswordDto.password,
    );
  }

  @ApiOperation({ summary: 'kankim✅ 채팅방 설정' })
  @Put(':roomId/users/:ownerId')
  async updateRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Body() updateChatRoomDto: UpdateChatRoomDto,
  ): Promise<ChatRoomDataDto> {
    return await this.chatService.updateRoom(
      roomId,
      ownerId,
      updateChatRoomDto,
    );
  }

  @ApiOperation({ summary: 'kankim✅ 채팅방 나가기' })
  @Delete(':roomId/users/:userId')
  async exitRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    await this.chatService.exitRoom(roomId, userId);
  }

  @ApiOperation({ summary: 'kankim✅ dm방 입장하기' })
  @Post(':myId/dmRooms')
  async enterDmRoom(
    @Param('myId', ParseIntPipe) myId: number,
    @Query('partnerId', ParseIntPipe) partnerId: number,
  ): Promise<ChatRoomDataDto> {
    return await this.chatService.enterDmRoom(myId, partnerId);
  }

  @ApiOperation({
    summary:
      'kankim *채팅 입력 api 구현 후 테스트 필요* 채팅방 메세지 기록 조회(내가 참여한 시점 이후)',
  })
  @Get(':roomId/chatContents/:userId')
  async getChatContents(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<CreateChatContentDto[]> {
    return await this.chatService.getChatContents(roomId, userId);
  }

  // // 채팅방 유저 목록 가져오기
  // @ApiOperation({ summary: '채팅방 유저 목록 가져오기' })
  // @Get(':roomId/participants')
  // async getChatParticipants(
  //   @Param('roomId', ParseIntPipe) roomId: number,
  // ): Promise<ChatParticipant[]> {
  //   return [];
  // }

  // // 채팅 내용 가져오기
  // @ApiOperation({ summary: '채팅 내용 가져오기' })
  // @Get(':roomId/contents')
  // async getChatContents(
  //   @Param('roomId', ParseIntPipe) roomId: number,
  // ): Promise<ChatContents[]> {
  //   return [];
  // }

  // // 게스트를 관리자로 설정하기(오너, 관리자)
  // @ApiOperation({
  //   summary: '게스트를 관리자로 설정하기(오너, 관리자만 가능)',
  // })
  // @Patch(':roomId/giveManager')
  // async giveManager(
  //   @Param('roomId', ParseIntPipe) roomId: number,
  //   @Query('targetUserId', ParseIntPipe) targetUserId: number,
  // ): Promise<void> {
  //   const a = 'giveManager';
  // }

  // // 관리자를 게스트로 설정하기(오너만)
  // @ApiOperation({ summary: '관리자를 게스트로 설정하기(오너만)' })
  // @Patch(':roomId/revokeManager')
  // async revokeManager(
  //   @Param('roomId', ParseIntPipe) roomId: number,
  //   @Query('targetUserId', ParseInt1Pipe) targetUserId: number,
  // ): Promise<void> {
  //   const a = 'revokeManager';
  // }

  @ApiOperation({ summary: '✅ 관리자로 설정 토글: jihokim' })
  @Patch(':roomId/role_toggle')
  async toggleManager(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('callingUserId', ParseIntPipe) callingUserId: number,
    @Query('targetUserId', ParseIntPipe) targetUserId: number,
  ): Promise<ParticipantRoleDto> {
    return this.chatService.toggleParticipantRole(
      roomId,
      callingUserId,
      targetUserId,
    );
  }

  // // 강퇴
  // @ApiOperation({ summary: '강퇴 시키기' })
  // @Patch(':roomId/ban')
  // async banParticipant(
  //   @Param('roomId', ParseIntPipe) roomId: number,
  //   @Query('targetUserId', ParseIntPipe) targetUserId: number,
  // ): Promise<void> {
  //   const a = 'banParticipant';
  // }
  // 강퇴
  @ApiOperation({ summary: 'seungyel✅ 강퇴 시키기' })
  @Patch(':roomId/ban/:userId')
  async banParticipant(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('targetUserId', ParseIntPipe) targetUserId: number,
  ): Promise<void> {
    return this.chatService.banUser(roomId, userId, targetUserId);
  }

  @ApiOperation({ summary: '✅ 음소거 시키기 토글: jihokim' })
  @Patch(':roomId/mute_toggle')
  async muteParticipant(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('targetUserId', ParseIntPipe) targetUserId: number,
  ): Promise<BooleanDto> {
    return this.chatService.muteCertainParticipant(roomId, targetUserId);
  }

  // 인터페이스를 통해 게임 할 수 있도록 초대
  // 인터페이스를 통해 다른 유저의 프로필 보기

  @ApiOperation({ summary: '채팅 등록' })
  @Post(':roomId/users/:userId/messages')
  async submitChatContent(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createChatContentDto: CreateChatContentDto,
  ): Promise<void> {
    this.chatService.submitChatContent(roomId, userId, createChatContentDto);
    // this.chatService.submitChatContent(roomId);
  }
}
