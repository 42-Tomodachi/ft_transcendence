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

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
constructor(
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantRepo: Repository<ChatParticipant>,
    ) {}
    
    @WebSocketServer()
    server: Server;

    async handleConnection(client: Socket, ...args: any[]) {
        console.log("Socket Connected-Server");
    }

    async handleDisconnect(client: any) {
        
    }

    @SubscribeMessage('enterChatRoom')
    async enterChatRoom(client: Socket, roomId: number): Promise<void> {
        client.join(roomId.toString());
        
        const chatParticipants: ChatParticipant[] = await this.chatParticipantRepo.find({ where: [{ chatRoomId: roomId }, ]});
        client.emit("updateChatList", chatParticipants);
        // console.log(`${client.id} is enter ${roomId} room.`);
    }

}