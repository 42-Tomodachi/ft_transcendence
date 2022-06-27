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

    @SubscribeMessage('submitChat')
    submitChat(client: Socket, message: string): void {
        
    }

}