import { InjectRepository } from '@nestjs/typeorm';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { ChatParticipant } from './entities/chatParticipant.entity';
import { ChatRoom } from './entities/chatRoom.entity';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantRepo: Repository<ChatParticipant>,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket, data: any) {
    console.log('Socket Connected-Server');
    client.join(data.roomId);
  }

  async handleDisconnect(client: any) {
    console.log('socket disconnect');
  }
  /**
   * recieveMessage
   * when send chat to client from server
   * nickname, msg, avatar, createdTime, isBroadcast, isMyMessage
   *
   * sendMessage
   * when send chat to server from client
   * userId, roomId, message
   */
  @SubscribeMessage('chatting')
  async enterChatRoom(client: Socket, roomId: number): Promise<void> {
    client.join(roomId.toString());

    const chatParticipants: ChatParticipant[] =
      await this.chatParticipantRepo.find({ where: [{ chatRoomId: roomId }] });
    client.emit('updateChatList', chatParticipants);
    // console.log(`${client.id} is enter ${roomId} room.`);
  }
}
