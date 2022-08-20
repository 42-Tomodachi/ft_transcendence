import { ConsoleLogger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEnv } from './class/game.class.GameEnv';
import { GameInfo } from './class/game.class.interface';

// @UseGuards(AuthGuard())
@WebSocketGateway({
  cors: true,
  // namespace: 'gameConn',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gameEnv: GameEnv) {}
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket): Promise<void> {
    const connectionType = client.handshake.query['connectionType']?.toString();
    const userId: number = parseInt(
      client.handshake.query['userId']?.toString(),
      10,
    );
    if (!userId) {
      console.log(`connection: New client has no userId`);
      client.emit('message', 'no userId');
      client.disconnect();
    }
    this.gameEnv.onFirstSocketHandshake(this, client, userId, connectionType);
    console.log(`New client connected: ${client.id}`);
    client.emit('message', `New client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.gameEnv.clearPlayerSocket(client);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('newLadderGame')
  async newLadderGame(client: Socket, userId: number): Promise<void> {
    this.gameEnv.enlistLadderQueue(this, client);
  }

  @SubscribeMessage('cancelLadderQueue')
  async cancleLadderQueue(client: Socket): Promise<void> {
    this.gameEnv.cancelLadderWaiting(client);
  }

  @SubscribeMessage('onMatchingScreen')
  async onMatchingScreen(client: Socket): Promise<void> {
    await this.gameEnv.waitForPlayerJoins(client);
  }

  @SubscribeMessage('calculatedRTData')
  async processRecievedRtData(client: Socket, data: GameInfo): Promise<void> {
    await this.gameEnv.processRecievedRtData(client, data);
  }

  @SubscribeMessage('paddleRTData')
  async paddleRTData(client: Socket, data: number): Promise<void> {
    await this.gameEnv.processRecievedPaddleRtData(client, data);
  }
}
