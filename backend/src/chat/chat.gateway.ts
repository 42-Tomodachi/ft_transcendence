import { forwardRef, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { CLIENT_RENEG_WINDOW } from 'tls';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { ChatContentDto } from './dto/chatContents.dto';
import { ChatParticipant } from './entities/chatParticipant.entity';
import { ChatRoom } from './entities/chatRoom.entity';

/**
 * recieveMessage
 * when send chat to client from server
 * nickname, msg, avatar, createdTime, isBroadcast, isMyMessage
 *
 * sendMessage
 * when send chat to server from client
 * userId, roomId, message
 */

// export class ChatToClientDto {
//   userId: number;
//   nickname: string;
//   avatar: string;
//   msg: string;
//   createdTime: Date;
//   isBroadcast: boolean;
//   // isMyMessage: boolean; // 소켓에 유저의 정보를 저장할 수 있나? 없다면 isMyMessage를 구분하여 리턴할 수 없음. 클라이언트에서 받은 데이터의 userId와 클라이언트 자신의 userId를 비교해야 할 듯
// }

class ChatToServerDto {
  userId: number;
  roomId: number;
  message: string;
}

class SocketUserInfo {
  socketId: string;
  userId: number;
}

@WebSocketGateway({ namespace: '/ws-chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly userService: UsersService,
  ) {}

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('ChatGateway');

  // Map<roomId, Map<socketId, userId>>
  connectedSocketMap = new Map<string, Map<string, string>>();

  async handleConnection(client: Socket) {
    const roomId = client.handshake.query.roomId as string;
    const userId = client.handshake.query.userId as string;

    this.logger.log(`socket id: ${client.id}, userId: ${userId} connected`);

    client.join(roomId);
    if (this.connectedSocketMap.has(roomId)) {
      this.connectedSocketMap.get(roomId).set(client.id, userId);
    } else {
      const socketUser = new Map<string, string>();
      socketUser.set(client.id, userId);
      this.connectedSocketMap.set(roomId, socketUser);
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`socket id: ${client.id} disconnected`);
  }

  // 채팅방에 처음 들어왔을 때 입장 메세지
  // 채팅방에서 나갔을 때 퇴장 메세지
  sendNoticeMessage(roomId: number, chatContentDto: ChatContentDto): void {
    this.logger.log(`roomId: ${roomId}, emit recieveMessage`);
    this.wss.to(roomId.toString()).emit('recieveMessage', chatContentDto);
  }

  /**
   * 채팅 프로세스
   * 1. 채팅 페이지 진입 시 소켓 연결
   * 2. 클라이언트에서 채팅 보내면 서버에서 받고 db에 저장 후 채팅방 참여자에게 메세지 리턴
   * 3. 클라이언트에서 받은 메세지의 userId가 클라이언트의 userId와 같으면 내가보낸 메세지 이므로 출력
   * 4. 클라이언트에서 받은 메세지의 userId가 클라이언트의 userId와 다르면 차단한 유저인지 isMessageFromBlockedUser 로 확인 후 리턴값이 false이면 출력
   */
  // 채팅을 보냈을 때 채팅방 참여자에게 메세지 전달
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ChatToServerDto,
  ): Promise<void> {
    this.logger.log(`roomId: ${data.roomId}, on sendMessage`);

    const chatContentDto = await this.chatService.createChatContent(
      data.userId,
      data.roomId,
      data.message,
    );

    const userInSocketRoom = this.connectedSocketMap.get(
      data.roomId.toString(),
    );

    const userIdsForCheck: number[] = [];
    for (const x of userInSocketRoom.values()) {
      userIdsForCheck.push(+x);
    }

    const unblockedUserIds = await this.userService.getUnblockedUserIds(
      userIdsForCheck,
      data.userId,
    );

    userInSocketRoom.forEach((userId, socketId) => {
      if (!unblockedUserIds.includes(+userId)) {
        return;
      }
      this.wss.to(socketId).emit('recieveMessage', chatContentDto);
    });
    // const socketsForEmit = this.wss
    //   .to(data.roomId.toString())
    //   .emit('recieveMessage', chatContentDto);
  }

  // 클라이언트가 받은 채팅을 검증(차단한 유저인지)하기 위해 사용
  // 받은 채팅을 보낸 유저가 내가 차단한 유저이면 true리턴 차단하지 않았으면 false 리턴
  @SubscribeMessage('isMessageFromBlockedUser')
  async isMessageFromBlockedUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string; myId: string }, // senderId: 메세지 보낸 유저 id, myId: 메세지 받은 유저 id
  ): Promise<void> {
    this.logger.log(`on isMessageFromBlockedUser`);

    const res = await this.chatService.isMessageFromBlockedUser(
      +data.myId,
      +data.senderId,
    );

    client.emit('isMessageFromBlockedUserResult', res);
  }

  @SubscribeMessage('clientDisconnect')
  clientDisconnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; roomId: string },
  ): void {
    if (this.connectedSocketMap.has(data.roomId)) {
      this.connectedSocketMap.get(data.roomId).delete(client.id);
    }
  }
}
