import { forwardRef, Inject, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';

@WebSocketGateway({ namespace: '/ws-chatLobby', cors: { origin: '*' } })
export class ChatLobbyGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('LobbyGateway');

  // Map<userId, socketId[]>
  connectedSocketMap = new Map<string, Set<string>>();

  handleConnection(client: Socket): void {
    const userId = client.handshake.query.userId as string;

    this.logger.log(
      `socketId: ${client.id}, userId: ${userId} connected at lobby`,
    );

    if (this.connectedSocketMap.has(userId)) {
      this.connectedSocketMap.get(userId).add(client.id);
    } else {
      const set = new Set([client.id]);
      this.connectedSocketMap.set(userId, set);
    }
    // 특정 소켓에 채팅방 목록 emit
    this.emitChatRoomList(client.id);
    // 특정 소켓에 전체 유저 목록 emit
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`socket id: ${client.id} disconnected`);

    this.connectedSocketMap.forEach((map) => {
      map.delete(client.id);
    });
  }

  // 유저 로그아웃 시 연결된 모든 소켓 disconnect
  disconnectUser(userId: string): void {
    const socketIds = this.connectedSocketMap.get(userId);

    socketIds.forEach((socketId) => {
      this.wss.to(socketId).emit('disconnectSocket', null);
      this.wss.to(socketId).disconnectSockets();
    });

    this.connectedSocketMap.delete(userId);
  }

  // 채팅방 목록 emit
  // 특정 소켓에 emit 할 경우 socketId 매개변수로 전달
  // 로비에 연결된 모든 소켓에 emit할 경우 매개변수 없이 호출
  async emitChatRoomList(socketId?: string): Promise<void> {
    const chatRoomList = await this.chatService.getChatRooms();

    if (socketId) {
      this.wss.to(socketId).emit('updateChatRoomList', chatRoomList);
    } else {
      this.wss.emit('updateChatRoomList', chatRoomList);
    }
  }

  // 로비에 연결된 유저의 id 가져오기
  // getConnectedUserIds(): string[] {
  //   const connectedUserIds: string[] = [];

  //   this.connectedSocketMap.forEach((socketSet, userId) => {
  //     connectedUserIds.push(userId);
  //   });

  //   return connectedUserIds;
  // }

  // 로비에 연결된 특정 유저의 socketId 가져오기
  getConnectedSocketIdsOfUser(userId: string): string[] | undefined {
    const socketIds = this.connectedSocketMap.get(userId);
    if (socketIds) {
      return [...socketIds];
    }
    return undefined;
  }

  // 참여중인 채팅방 목록 emit
  // 1. 방 정보가 변경되면 emitParticipantingChatRoomList 호출: 방 제목 변경, 방 입퇴장(인원수 변경), 방 삭제되는 경우 - in chatLobby
  // 2. 방에 참여중인 유저 id 가져오기 - in chatService
  // 3. 2에서 가져온 유저의 id를 현재 로비 소켓에 연결되어 있는 유저의 id로 필터링 - in chatService에서 chatLobby의 getConnectedSocketIdsOfUser 함수 활용
  // 4. 해당 유저의 소켓에 채팅방 목록 emit - in lobbyGateway
  async emitParticipantingChatRoomList(roomId: number): Promise<void> {
    const chatRoomUserDtos = await this.chatService.getRoomParticipants(roomId);

    const participantIds = chatRoomUserDtos.map(
      (chatRoomUserDto) => chatRoomUserDto.userId,
    );

    participantIds.forEach((participantId) => {
      const socketIds = this.getConnectedSocketIdsOfUser(
        participantId.toString(),
      );

      if (socketIds) {
        socketIds.forEach(async (socketId) => {
          const chatRoomList =
            await this.chatService.getParticipantingChatRoomsForEmit(
              participantId,
            );

          this.wss
            .to(socketId)
            .emit('updateParticipnatingChatRoomList', chatRoomList);
        });
      }
    });
  }

  // 특정 소켓에 전체 유저 목록 emit
  emitUserListToSpecificSocket(socketId: string): void {}
  // ws-chatLobby namespace에 전체 유저 목록 emit
  emitUserListToNamespace(): void {}

  // 특정 소켓에 친구 목록 emit
  emitFriendListToSpecificSocket(socketId: string, myId: string): void {}
  // 나를 친구 추가한 유저의 소켓에 친구 목록 emit
  emitFriendlistToNamespace(): void {}
}
