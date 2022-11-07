import { forwardRef, Inject, Logger, UseGuards } from '@nestjs/common';
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
  namespace: 'ws-game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(forwardRef(() => GameEnv))
    private readonly gameEnv: GameEnv,
  ) {}

  private logger = new Logger('GameGateway');

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket): Promise<void> {
    const connectionType = client.handshake.query['connectionType']?.toString();
    const userId: number = +client.handshake.query['userId'];
    const gameId: number = +client.handshake.query['roomId'];
    if (!userId) {
      this.logger.debug('connection attempt without userId');
      client.send('no userId');
    }
    this.gameEnv.onFirstSocketHandshake(client, userId, gameId, connectionType);
  }

  handleDisconnect(client: Socket): void {
    const connectionType = client.handshake.query['connectionType']?.toString();
    const userId: number = +client.handshake.query['userId'];
    const gameId: number = +client.handshake.query['roomId'];

    this.gameEnv.onSocketDisconnect(client, connectionType, userId, gameId);
  }

  @SubscribeMessage('onMatchingScreen')
  async onMatchingScreen(client: Socket, gameId: number): Promise<void> {
    setTimeout(() => {
      this.gameEnv.waitForPlayerJoins(client, gameId);
    }, 300);
  }

  @SubscribeMessage('calculatedRTData')
  async processRecievedRtData(client: Socket, data: GameInfo): Promise<void> {
    await this.gameEnv.processRecievedRtData(client, data);
  }

  @SubscribeMessage('paddleRTData')
  async paddleRTData(client: Socket, data: number): Promise<void> {
    await this.gameEnv.processRecievedPaddleRtData(client, data);
  }

  broadcastToLobby(ev: string, ...args: any[]): void {
    if (this && this.server) this.server.to('gameLobby').emit(ev, ...args);
  }
}
