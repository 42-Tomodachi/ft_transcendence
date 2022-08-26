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
    const userId: number = +client.handshake.query['userId'];
    const gameId: number = +client.handshake.query['roomId'];
    if (!userId) {
      console.log(`connection: New client has no userId`);
      client.send('no userId');
      client.disconnect();
    }
    this.gameEnv.onFirstSocketHandshake(client, userId, gameId, connectionType);
  }

  handleDisconnect(client: Socket): void {
    const connectionType = client.handshake.query['connectionType']?.toString();
    this.gameEnv.onSocketDisconnect(client, connectionType);
  }

  @SubscribeMessage('cancelLadderQueue')
  async cancleLadderQueue(client: Socket): Promise<void> {
    this.gameEnv.cancelLadderWaiting(client);
  }

  @SubscribeMessage('onMatchingScreen')
  async onMatchingScreen(client: Socket, gameId: number): Promise<void> {
    await this.gameEnv.waitForPlayerJoins(client, gameId);
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
