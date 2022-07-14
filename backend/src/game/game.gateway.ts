import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'games' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor() {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket, ...args: any[]) {
    console.log('Socket Connected-Server');
  }

  async handleDisconnect(client: any) {}

  @SubscribeMessage('enterGameRoom')
  async enterGameRoom(client: Socket, gameId: number): Promise<void> {
    client.join(gameId.toString());
    // console.log('gateway gameId: ', gameId);
  }

  @SubscribeMessage('exitGameRoom')
  async exitGameRoom(client: Socket, gameId: number): Promise<void> {
    client.leave(gameId.toString());
  }

  @SubscribeMessage('deleteGameRoom')
  async deleteGameRoom(client: Socket, gameId: number): Promise<void> {
    this.server.socketsLeave(gameId.toString());
  }
}
