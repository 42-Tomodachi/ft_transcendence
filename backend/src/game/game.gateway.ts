import { ConsoleLogger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { GameService } from './game.service';
import { GameEnv, GameInfo, Player } from './game.gameenv';
import { Length } from 'class-validator';
import { use } from 'passport';

// @UseGuards(AuthGuard())
@WebSocketGateway({
  cors: true,
  // namespace: 'gameConn',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly gameService: GameService,
    private readonly gameEnv: GameEnv,
  ) {}
  @WebSocketServer()
  server: Server;

  socketMap = new Map<string, Player>();

  setSocketToPlayer(client: Socket, userId: number): Player {
    let player = this.gameEnv.getPlayerByUserId(userId);
    if (!player) {
      console.log('unregistered userId');
      player = this.gameEnv.newPlayer(client, userId, null);
    }

    this.socketMap[client.id] = player;
    return player;
  }

  async getUserBySocket(socket: Socket): Promise<User> {
    const player: Player = this.socketMap[socket.id];
    const user = await this.userRepo.findOne({ where: { id: player.userId } });
    return user;
  }

  getSocketIdByUserId(userId: number): string {
    let socket: string;
    this.socketMap.forEach((value, key) => {
      if (value.userId === userId) socket = key;
    });
    return socket;
  }

  joinPlayerToRoom(player: Player, gameId: number): void {
    player.socket.join(gameId.toString());
  }

  sendMatchData(user1: User, user2: User): boolean {
    const player1 = this.gameEnv.getPlayerByUserId(user1.id);
    if (!player1) return false;

    if (user2) {
      const player2 = this.gameEnv.getPlayerByUserId(user2.id);
      if (!player2) return false;
      if (player1.gamePlaying !== player2.gamePlaying) return false;
    }

    this.server
      .to(player1.gamePlaying.toString())
      .emit('matchData', user1.toGamerInfoDto(), user2?.toGamerInfoDto());
  }

  async handleConnection(client: Socket): Promise<void> {
    console.log(`New client connected: ${client.id}`);

    const userId: number = parseInt(
      client.handshake.query['userId']?.toString(),
      10,
    );
    if (!userId) {
      console.log(`connection: New client has no userId`);
      client.emit('message', 'no userId');
      client.disconnect();
    }
    const player = this.setSocketToPlayer(client, userId);

    const gameRoom = player.gamePlaying;
    // const roomId: number = parseInt(
    //   socket.handshake.query['roomId']?.toString(),
    //   10,
    // );
    if (!gameRoom) {
      console.log('connection: no Room on user');
      client.emit('message', 'no Room on user');
      return;
    } else {
      client.join(gameRoom.roomId.toString());
    }
    if (gameRoom.firstPlayer.userId === userId) {
      console.log(`Client owns room ${gameRoom}.`);
      // this.sendMatchData(await this.getUserBySocket(client), null);
    }
    if (gameRoom.secondPlayer?.userId === userId) {
      console.log(`Client joins room ${gameRoom}.`);
      // this.sendMatchData(null, await this.getUserBySocket(client));
    }
    client.emit('message', 'message you connect success okok');
    // 유저 상태 게임중으로 변경
  }

  handleDisconnect(socket: Socket): void {
    console.log(`Client disconnected: ${socket.id}`);
    this.gameEnv.removePlayer(this.socketMap[socket.id]);
    this.socketMap.delete(socket.id);
    // 해당 유저 퇴장 알림
    // 유저 상태 접속중으로 변경
  }

  @SubscribeMessage('test')
  async test(client: Socket, data: number): Promise<string> {
    console.log(this.socketMap);
    console.log(`testData: ${data}`);
    return 'iswork';
  }

  @SubscribeMessage('newLadderGame')
  async newLadderGame(client: Socket, userId: number): Promise<void> {
    const player = this.gameEnv.getPlayerByUserId(+userId);
    console.log(`newLadderGame: ${userId}, ${player}`);
    const matchMade = this.gameEnv.enlistLadderQueue(player);
    console.log(matchMade);
    if (matchMade) {
      this.server
        .to(matchMade.roomId.toString())
        .emit('matchingGame', matchMade.roomId.toString());
      // (소켓) 모든 클라이언트에 새로 만들어진 게임방이 있음을 전달
      // this.emitEvent('addGameList', gameRoomAtt.toGameRoomProfileDto());
    } else {
      this.server.to(client.id).emit('message', '래더 대기열 부족');
    }
  }

  @SubscribeMessage('cancelLadderQueue')
  async cancleLadderQueue(client: Socket): Promise<void> {
    this.socketMap.delete(client.id);
    this.gameEnv.removeFromLadderQueue(
      this.gameEnv.getPlayerByUserId(this.socketMap[client.id]),
    );
    client.disconnect();
  }

  @SubscribeMessage('onMatchingScreen')
  async onMatchingScreen(client: Socket, roomId: number): Promise<void> {
    const gameRoom = this.gameEnv.getGameRoom(roomId);
    const player1asUser: User = await this.userRepo.findOne({
      where: { id: gameRoom.firstPlayer.userId },
    });
    const player2asUser: User = gameRoom.secondPlayer
      ? await this.userRepo.findOne({
          where: { id: gameRoom.secondPlayer?.userId },
        })
      : undefined;
    this.server
      .to(gameRoom.roomId.toString())
      .emit(
        'matchData',
        player1asUser.toGamerInfoDto(),
        player2asUser?.toGamerInfoDto(),
      );

    if (!player2asUser) return;

    let counting = 5;
    this.server
      .to(gameRoom.roomId.toString())
      .emit('gameStartCount', `${counting}`);
    const timer: NodeJS.Timer = setInterval(() => {
      this.server
        .to(gameRoom.roomId.toString())
        .emit('gameStartCount', `${counting}`);
      counting--;
      if (counting < 0) {
        clearInterval(timer);
      }
    }, 1000);

    setTimeout(
      () => {
        gameRoom.gameStart(this);
      },
      5000,
      counting--,
    );
  }

  @SubscribeMessage('calculatedRTData')
  async calculatedRTData(client: Socket, data: GameInfo): Promise<void> {
    // console.log(`calculatedRTData: ${data}`); // for test only

    const player: Player = this.socketMap[client.id];
    const game = player.gamePlaying;

    game.updateRtData(data);
    if (game.isFinished()) {
      console.log(`game is finished ${game.roomId}`);
      game.isPlaying = false;
      await this.gameService.saveGameRecord(game.toGameResultDto());
      this.gameEnv.postGameProcedure(game);
      this.server.to(game.roomId.toString()).emit('gameFinished');
    }
    game.streamRtData(this);
  }

  @SubscribeMessage('paddleRTData')
  async paddleRTData(client: Socket, data: number): Promise<void> {
    // console.log(`paddleRTData: ${data}`); // for test only

    const player = this.socketMap[client.id];
    const game = player.gamePlaying;

    game.updatePaddleRtData(data);
    game.streamRtData(this);
  }
}
