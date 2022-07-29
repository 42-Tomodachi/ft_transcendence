import { UseGuards } from '@nestjs/common';
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

const HERTZ = 60;

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

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getUserBySocket(socket: Socket): Promise<User> {
    const userId: number = this.socketMap[socket.id];
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return user;
  }

  handleConnection(socket: Socket) {
    console.log(`New client connected: ${socket.id}`);

    const userId: number = parseInt(
      socket.handshake.query['userId']?.toString(),
      10,
    );
    if (!userId) {
      console.log(`New client has no userId`);
      socket.disconnect();
    }
    this.socketMap[socket.id] = new Player(socket, userId, null);

    socket.emit('message', 'message you connect success okok');
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    this.socketMap.delete(socket.id);
    // 해당 유저 퇴장 알림
  }

  @SubscribeMessage('test')
  async test(client: Socket, data: number): Promise<string> {
    console.log(this.socketMap);
    console.log(`testData: ${data}`);
    return 'iswork';
  }

  setSocketToPlayer(client: Socket, userId: number) {
    let player: Player = null;

    for (const playerr of this.socketMap.values()) {
      if (playerr.userId === userId) {
        player = playerr;
        player.socket = client;
        this.socketMap.delete(player.socket.id);
        break;
      }
    }
    if (!player) {
      // player = new Player(client, userId, null); // player 생성
      player = this.gameEnv.newPlayer(client, userId, null);
    }
    this.socketMap[client.id] = player; // socketMap에 유저 등록
    return player;
  }

  @SubscribeMessage('newLadderGame')
  async newLadderGame(client: Socket, userId: number): Promise<void> {
    const player = this.setSocketToPlayer(client, userId);
    console.log(`newLadderGame: ${userId}`);
    const matchMade = this.gameEnv.enlistLadderQueue(player);
    if (matchMade) {
      this.server
        .to(matchMade.roomId.toString())
        .emit('matchingGame', matchMade.roomId.toString());
      // (소켓) 모든 클라이언트에 새로 만들어진 게임방이 있음을 전달
      // this.emitEvent('addGameList', gameRoomAtt.toGameRoomProfileDto());
    }
  }

  @SubscribeMessage('cancelLadderQueue')
  async cancleLadderQueue(client: Socket) {
    this.socketMap.delete(client.id);
    this.gameEnv.removeFromLadderQueue(
      this.gameEnv.getPlayerById(this.socketMap[client.id]),
    );
    client.disconnect();
  }

  @SubscribeMessage('onMatchingScreen')
  async onMatchingScreen(client: Socket, roomId: number): Promise<void> {
    const gameRoom = this.gameEnv.getGameRoom(roomId);
    const player1asUser: User = await this.userRepo.findOne({
      where: { id: gameRoom.firstPlayer.userId },
    });
    const player2asUser: User = await this.userRepo.findOne({
      where: { id: gameRoom.secondPlayer.userId },
    });
    console.log(`onMatchingScreen`); // for test only
    client.emit(
      'matchData',
      player1asUser.toGamerInfoDto(),
      player2asUser.toGamerInfoDto(),
    );

    let counting = 5;
    client.emit('gameStartCount', `${counting}`);
    const timer: NodeJS.Timer = setInterval(() => {
      client.emit('gameStartCount', `${counting}`);
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
  async calculatedRTData(client: Socket, data: GameInfo) {
    // console.log(`calculatedRTData: ${data}`); // for test only

    const player = this.socketMap[client.id];
    const game = this.gameEnv.getGameRoom(player.gameId);

    game.updateRtData(data);
    if (game.isFinished()) {
      this.gameService.saveGameRecord(game.toGameResultDto());
      game.gameStop();
      this.server.to(game.roomId.toString()).emit('gameFinished');
    }
    game.streamRtData(this);
  }

  @SubscribeMessage('paddleRTData')
  async paddleRTData(client: Socket, data: number) {
    // console.log(`paddleRTData: ${data}`); // for test only

    const player = this.socketMap[client.id];
    const game = this.gameEnv.getGameRoom(player.gameId);

    game.updatePaddleRtData(data);
    game.streamRtData(this);
  }
}
