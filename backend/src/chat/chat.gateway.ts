import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer()
    server: Server;

    async handleConnection(client: Socket, ...args: any[]) {
        console.log("Socket Connected-Server");
    }

    async handleDisconnect(client: any) {

    }

    @SubscribeMessage('enterChatRoom')
    enterChatRoom(client: Socket, roomId: string): void {
        client.join(roomId);
        console.log(`${client.id} is enter ${roomId} room.`);
    }

}