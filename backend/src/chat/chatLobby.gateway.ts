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
  async emitChatRoomList(socketId?: string): Promise<void> {
    const chatRoomList = await this.chatService.getChatRooms();

    if (socketId) {
      this.wss.to(socketId).emit('updateChatRoomList', chatRoomList);
    } else {
      this.wss.emit('updateChatRoomList', chatRoomList);
    }
  }

  // 참여중인 채팅방 목록 emit
  emitParticipatingChatRoomList(socketId: string, userId: string): void {}
  // 특정 소켓에 채팅방 목록 emit
  emitChatRoomListToSpecificSocket(socketId: string): void {}
  // ws-chatLobby namespace에 채팅방 목록 emit
  emitChatRoomListToNamespace(): void {}

  // 특정 소켓에 전체 유저 목록 emit
  emitUserListToSpecificSocket(socketId: string): void {}
  // ws-chatLobby namespace에 전체 유저 목록 emit
  emitUserListToNamespace(): void {}

  // 특정 소켓에 친구 목록 emit
  emitFriendListToSpecificSocket(socketId: string, myId: string): void {}
  // 나를 친구 추가한 유저의 소켓에 친구 목록 emit
  emitFriendlistToNamespace(): void {}
}
