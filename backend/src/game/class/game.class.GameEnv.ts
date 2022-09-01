import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { CreateGameRoomDto } from '../dto/game.dto';
import { Player } from './game.class.Player';
import { GameAttribute } from './game.class.GameAttribute';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { GameRecord } from 'src/users/entities/gameRecord.entity';
import { GameInfo } from './game.class.interface';
import { UserStatusContainer } from 'src/userStatus/userStatus.service';

@Injectable()
export class GameEnv {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private userStats: UserStatusContainer,
  ) {
    for (let index = 0; index < 100; index++) {
      this.gameRoomList[index] = new GameAttribute(index + 1);
    }
  }

  socketIdToPlayerMap = new Map<string, Player>();
  playerList: Player[] = [];
  gameLobbyTable: Set<Socket> = new Set();
  gameRoomList: GameAttribute[] = new Array(100);
  ladderQueue: Player[] = [];

  //
  // socketMap related methods

  getPlayerBySocket(socket: Socket): Player {
    return this.socketIdToPlayerMap.get(socket.id);
  }

  async getUserBySocket(socket: Socket): Promise<User> {
    const player: Player = this.socketIdToPlayerMap[socket.id];
    const user = await this.userRepo.findOne({ where: { id: player.userId } });
    return user;
  }

  getSocketIdByUserId(userId: number): string {
    let socket: string;
    this.socketIdToPlayerMap.forEach((value, key) => {
      if (value.userId === userId) socket = key;
    });
    return socket;
  }

  assertGetPlayerBySocket(client: Socket, userId: number): Player {
    let player = this.getPlayerBySocket(client);
    if (!player) {
      console.log(`unregistered userId ${userId}`);
      player = this.newPlayer(userId, null);
      this.socketIdToPlayerMap.set(client.id, player);
    }
    return player;
  }

  eraseFromSocketMap(client: Socket): void {
    this.socketIdToPlayerMap.delete(client.id);
  }

  //
  // gameRoom* related methods

  getFreeGameRoom(): GameAttribute {
    for (const game of this.gameRoomList) {
      if (game.active === false) {
        return game;
      }
    }
    return null;
  }

  getGameRoom(gameId: number): GameAttribute {
    return this.gameRoomList.at(gameId - 1);
  }

  //
  // basic getters

  async getUserByUserId(userId: number): Promise<User> {
    return this.userRepo.findOneBy({ id: userId });
  }

  async getUserByPlayer(player: Player): Promise<User> {
    if (!player) return undefined;
    return this.userRepo.findOneBy({ id: player.userId });
  }

  getPlayerByUserId(userId: number): Player {
    const player = this.playerList.find((player) => {
      return player.userId === userId;
    });
    if (!player) return this.newPlayer(userId, null);
    else return player;
  }

  newPlayer(userId: number, game: GameAttribute): Player {
    for (const player of this.playerList) {
      if (player.userId === userId) {
        return player;
      }
    }
    const newPlayer = new Player(userId, game);
    this.playerList.push(newPlayer);
    return newPlayer;
  }

  //
  // socket connection managing methods
  // 소켓 연결 전에, 소켓을 제외한 모든 셋업은 api를 통해 처리되어 있어야 함.

  handleConnectionOnLobby(client: Socket, player: Player): void {
    this.gameLobbyTable.add(client);
    client.join('gameLobby');

    player.socketLobbySet.add(client);

    this.userStats.setSocket(player.userId, client, () => {
      // TODO: 상태변화 전송
    });
  }

  handleDisconnectionOnLobby(client: Socket, player: Player): void {
    player.socketLobbySet.delete(client);
    this.gameLobbyTable.delete(client);

    this.userStats.removeSocket(player.userId, client, () => {
      // TODO: 상태변화 전송
    });
  }

  handleConnectionOnDuel(client: Socket, player: Player): void {
    const opponentId: number = +client.handshake.query['targetId'];
    const isChallenger = client.handshake.query['isSender'];
    const opponent = this.getPlayerByUserId(opponentId);
    if (!opponent) {
      console.log('handleConnectionOnDuel: no opponent');
      return;
    }

    if (isChallenger == 'true') {
      player.socketQueue = client;

      const notifying: Socket[] = this.userStats.getSockets(opponentId);
      for (const sock of notifying) {
        sock.emit('challengeDuelFrom', player.userId);
      }
      client.on('acceptChallenge', () => {
        this.makeDuelMatch(player, opponent, 'normal');
        for (const sock of notifying) {
          sock.emit('challengeAccepted', player.userId);
        }
      });
      return;
    }

    client.on('acceptChallenge', () => {
      opponent.socketQueue.emit('acceptChallenge');
      client.off('acceptChallenge', null);
    });
  }

  handleDisconnectionOnDuel(client: Socket, player: Player): void {
    const opponentId: number = +client.handshake.query['targetId'];
    const opponent = this.getPlayerByUserId(opponentId);
    const isChallenger = client.handshake.query['isSender'];
    if (!opponent) {
      console.log('handleDisconnectionOnDuel: no opponent');
      return;
    }

    const notifying: Socket[] = this.userStats.getSockets(opponentId);
    if (isChallenger == 'true') {
      for (const sock of notifying) {
        sock.emit('challengeSeqDone', player.userId);
        player.socketQueue = null;
      }
      return;
    }

    opponent.socketQueue.emit('challengeRejected', player.userId);
  }

  handleConnectionOnLadderQueue(client: Socket, player: Player): void {
    player.socketQueue = client;
    this.enlistLadderQueue(player);
    // remove socket when no further connection
  }

  handleDisconnectionOnLadderQueue(client: Socket, player: Player): void {
    player.socketQueue = null;
    this.cancelLadderWaiting(client);

    this.userStats.removeSocket(player.userId, client, () => {
      // TODO: 상태변화 전송
    });
  }

  handleConnectionOnLadderGame(client: Socket, player: Player): void {
    const game = player.gamePlaying;

    player.setGameSocket(game, client);
    this.setSocketJoin(client, game);

    this.userStats.setSocket(player.userId, client, () => {
      // TODO: 상태변화 전송
    });
  }

  handleDisconnectionOnLadderGame(client: Socket, player: Player): void {
    this.clearPlayerSocket(client);

    this.userStats.removeSocket(player.userId, client, () => {
      // TODO: 상태변화 전송
    });
  }

  handleConnectionOnNormalGame(
    client: Socket,
    gameId: number,
    player: Player,
  ): void {
    if (!gameId) {
      console.log(`connection: New client has no gameId`);
      client.send('no gameId');
      client.emit('fatalError'); //
      return;
    }
    const game = this.getGameRoom(gameId);
    if (
      game.firstPlayer !== player &&
      game.secondPlayer !== player &&
      !game.watchers.has(player)
    )
      return;
    if (player.gamePlaying !== game && !player.gamesWatching.has(game)) return;

    player.setGameSocket(game, client);
    this.setSocketJoin(client, game);

    this.userStats.setSocket(player.userId, client, () => {
      // TODO: 상태변화 전송
    });
  }

  handleDisconnectionOnNormalGame(client: Socket, player: Player): void {
    this.clearPlayerSocket(client);

    this.userStats.removeSocket(player.userId, client, () => {
      // TODO: 상태변화 전송
    });
  }

  onFirstSocketHandshake(
    client: Socket,
    userId: number,
    gameId: number,
    connectionType: string,
  ): void {
    const player = this.assertGetPlayerBySocket(client, userId);
    this.socketIdToPlayerMap[client.id] = player;

    switch (connectionType) {
      case 'gameLobby':
        this.handleConnectionOnLobby(client, player);
        break;
      case 'duel':
        this.handleConnectionOnDuel(client, player);
        break;
      case 'ladderQueue':
        this.handleConnectionOnLadderQueue(client, player);
        break;
      case 'ladderGame':
        this.handleConnectionOnLadderGame(client, player);
        break;
      case 'normalGame':
        this.handleConnectionOnNormalGame(client, gameId, player);
        break;
      default:
        const message = `ConnectionHandler: ${connectionType} is not a correct type of connection.`;
        console.log(message);
        client.send(message);
    }
    console.log(
      `New client connected: ${client.id.slice(
        0,
        6,
      )} ${connectionType} user:${userId} game:${gameId}`,
    );
    client.send(
      `New client connected: ${client.id.slice(
        0,
        6,
      )} ${connectionType} user:${userId} game:${gameId}`,
    );
  }

  onSocketDisconnect(
    client: Socket,
    connectionType: string,
    userId: number,
    gameId: number,
  ): void {
    const player = this.getPlayerBySocket(client);
    if (!player) {
      console.log('onSocketDisconnect: Cannot get Player with socket');
    }
    // this.socketIdToPlayerMap[client.id] = player;

    switch (connectionType) {
      case 'gameLobby':
        this.handleDisconnectionOnLobby(client, player);
        break;
      case 'duel':
        this.handleDisconnectionOnDuel(client, player);
        break;
      case 'ladderQueue':
        this.handleDisconnectionOnLadderQueue(client, player);
        break;
      case 'ladderGame':
        this.handleDisconnectionOnLadderGame(client, player);
        break;
      case 'normalGame':
        this.handleDisconnectionOnNormalGame(client, player);
        break;
      default:
        const message = `ConnectionHandler: ${connectionType} is not a correct type of connection.`;
        console.log(message);
        client.send(message);
    }
    console.log(
      `Client disconnected: ${client.id.slice(
        0,
        6,
      )} ${connectionType} user:${userId} game:${gameId}`,
    );
    client.send(
      `Client disconnected: ${client.id.slice(
        0,
        6,
      )} ${connectionType} user:${userId} game:${gameId}`,
    );
  }

  clearPlayerSocket(client: Socket): void {
    const player: Player = this.socketIdToPlayerMap[client.id];
    if (player === undefined) return;

    const game = player.socketsToGameMap.get(client);
    if (game) {
      // if (game.isPlaying === true) {
      //   player.unsetGameSocket(client);
      //   player.socketPlayingGame = undefined;
      //   return;
      // }
      if (game.isPlaying === true && player.socketPlayingGame === client) {
        const winner =
          game.firstPlayer === player ? game.secondPlayer : game.firstPlayer;
        this.terminateGame(game, winner);
      }
      player.unsetGameSocket(client);
      player.leaveGame(game);
    }

    this.eraseFromSocketMap(client);

    // 해당 유저 퇴장 알림
    // 유저 상태 접속중으로 변경
  }

  //
  // game managing methods

  isDuelAvailable(userId: number): boolean {
    const player = this.getPlayerByUserId(userId);

    const userStatus = this.userStats.getStatus(userId);
    if (userStatus !== 'on') {
      console.log('isDuelAvailable: user unavailable');
      return false;
    }
    if (player.socketQueue) {
      console.log('isDuelAvailable: target is on queue');
      return false;
    }
    return true;
  }

  setTimerOfRoomCancel(game: GameAttribute): NodeJS.Timer {
    return setTimeout(() => {
      game.destroy();
    }, 5000);
  }

  createGameRoom(player: Player, createGameRoomDto: CreateGameRoomDto): number {
    const game = this.getFreeGameRoom();
    game.create(createGameRoomDto, player);
    player.gamePlaying = game;

    // (소켓) 모든 클라이언트에 새로 만들어진 게임방이 있음을 전달
    // this.emitEvent('addGameList', gameRoomAtt.toGameRoomProfileDto());

    return game.roomId;
  }

  setSocketJoin(client: Socket, game: GameAttribute): void {
    if (!game) {
      console.log('setSocketJoin: game is undefined.');
      return;
    }
    client.join(game.roomId.toString());
  }

  joinPlayerToGame(player: Player, game: GameAttribute): number {
    player.joinGame(game);

    // socket emit
    return game.playerCount;
  }

  broadcastToLobby(ev: string, ...args: any[]): void {
    if (this.gameLobbyTable.size === 0) {
      console.log('broadcastToLobby: No game lobby on connected');
      return;
    }
    const randomLobby: Socket = this.gameLobbyTable.values().next().value;
    randomLobby.to('gameLobby').emit(ev, ...args);
    randomLobby.emit(ev, ...args);
  }

  postGameProcedure(game: GameAttribute): void {
    if (game.isLadder === true) {
      game.destroy();
    } else {
      game.destroy();
      // game.initPlayData();
    }
    // clearInterval(this.streaming);
  }

  enlistLadderQueue(player: Player): void {
    this.ladderQueue.push(player);
    console.log(`enlistLadderQueue: length: ${this.ladderQueue.length}`);
    const newMatch = this.makeLadderMatch();

    if (newMatch) {
      console.log(`newLadderGame: ${newMatch}, ${player}`);
      player.socketQueue = null;
    } else {
      player.socketQueue.send('래더 대기열 부족');
    }
  }

  cancelLadderWaiting(client: Socket): void {
    this.eraseFromSocketMap(client);
    const index = this.ladderQueue.indexOf(this.getPlayerBySocket(client));
    this.ladderQueue.splice(index, 1);
  }

  createCustomGame(p1: Player, p2: Player, gameMode: string): GameAttribute {
    if (!p1 || !p2) return undefined;

    const game = this.getFreeGameRoom();
    if (!game) {
      console.log('makeCustomMatch: Cannot get Empty Room');
      return undefined;
    }
    const createGameRoomDto = new CreateGameRoomDto();
    createGameRoomDto.roomTitle = `Match of ${p1.userId}, ${p2.userId}`;
    createGameRoomDto.password = null;
    createGameRoomDto.gameMode = gameMode as 'normal' | 'speed' | 'obstacle';
    createGameRoomDto.ownerId = p1.userId;

    game.create(createGameRoomDto, p1);
    game.secondPlayer = p2;
    game.playerCount = 2;

    p1.gamePlaying = game;
    p2.gamePlaying = game;
    return game;
  }

  makeDuelMatch(
    player1: Player,
    player2: Player,
    gameMode: string,
  ): GameAttribute {
    if (!player1 || !player2) return undefined;

    const game = this.createCustomGame(player1, player2, gameMode);

    console.log(`Duel match made: ${player1.userId}, ${player2.userId}`);

    player1.socketQueue.emit('matchingGame', game.roomId.toString());
    player2.socketQueue.emit('matchingGame', game.roomId.toString());

    return game;
  }

  makeLadderMatch(): GameAttribute {
    if (this.ladderQueue.length < 2) {
      return undefined;
    }
    const player1 = this.ladderQueue.shift();
    const player2 = this.ladderQueue.shift();

    const game = this.createCustomGame(player1, player2, 'normal');
    game.isLadder = true;

    console.log(`Ladder match made: ${player1.userId}, ${player2.userId}`);

    player1.socketQueue.emit('matchingGame', game.roomId.toString());
    player2.socketQueue.emit('matchingGame', game.roomId.toString());

    return game;
  }

  async waitForPlayerJoins(client: Socket, gameId: number): Promise<void> {
    const player = this.getPlayerBySocket(client);
    const game = this.getGameRoom(gameId);
    const isRightGame = player.gamePlaying === game;
    if (!isRightGame && player.gamesWatching.get(game) !== client) {
      console.log(
        `waitForPlayerJoins: ${player.userId} sent wrong roomNo.${gameId}`,
      );
      client.send('Error: recieved wrong room number');
      return;
    }

    const player1asUser: User = await this.userRepo.findOne({
      where: { id: game.firstPlayer.userId },
    });
    const player2asUser: User = game.secondPlayer
      ? await this.userRepo.findOne({
          where: { id: game.secondPlayer.userId },
        })
      : undefined;

    if (game.isPlaying === true) {
      client.emit(
        'matchData',
        player1asUser.toGamerInfoDto(),
        player2asUser?.toGamerInfoDto(),
      );
      client.emit('gameStartCount', '0');
      return;
    }

    game.broadcastToRoom(
      'matchData',
      player1asUser.toGamerInfoDto(),
      player2asUser?.toGamerInfoDto(),
    );

    if (player2asUser) game.startCountdown();
  }

  async processRecievedRtData(client: Socket, data: GameInfo): Promise<void> {
    const player: Player = this.getPlayerBySocket(client);
    const game = player.gamePlaying;
    if (!game) return;

    game.updateRtData(data);
    if (game.isFinished()) {
      await this.endGame(game);
    }
    game.sendRtData();
  }

  async processRecievedPaddleRtData(
    client: Socket,
    data: number,
  ): Promise<void> {
    const player: Player = this.getPlayerBySocket(client);
    const game = player.gamePlaying;

    game.updatePaddleRtData(data);
    game.sendRtData();
  }

  async endGame(game: GameAttribute): Promise<void> {
    console.log(`game is finished ${game.roomId}`);
    game.isPlaying = false;
    game.broadcastToRoom('gameFinished');
    await this.writeMatchResult(game);
    this.postGameProcedure(game);
  }

  async terminateGame(game: GameAttribute, winner: Player): Promise<void> {
    let winSide: number;

    console.log(
      `game ${game.roomId} is terminated, winner is ${winner.userId}`,
    );
    if (winner === game.firstPlayer) {
      game.rtData.scoreLeft = 11;
      game.rtData.scoreRight = 0;
      winSide = 1;
    } else {
      game.rtData.scoreLeft = 0;
      game.rtData.scoreRight = 11;
      winSide = 2;
    }
    game.isPlaying = false;
    game.broadcastToRoom('gameTerminated', winSide);
    await this.writeMatchResult(game);
    this.postGameProcedure(game);
  }

  async writeMatchResult(game: GameAttribute): Promise<void> {
    const winnerId = game.getWinner().userId;

    const p1 = game.firstPlayer;
    const p2 = game.secondPlayer;
    const isLadder = game.isLadder;

    const newRecord = new GameRecord();
    newRecord.playerOneId = game.firstPlayer.userId;
    newRecord.playerOneScore = game.rtData.scoreLeft;
    newRecord.playerTwoId = game.secondPlayer.userId;
    newRecord.playerTwoScore = game.rtData.scoreRight;
    newRecord.winnerId = winnerId;

    const firstPlayer = await this.getUserByPlayer(p1);
    const secondPlayer = await this.getUserByPlayer(p2);
    if (!firstPlayer || !secondPlayer) {
      console.log('writeMatchResult: cannot get user from the database');
      return;
    }

    if (winnerId === firstPlayer.id) {
      if (isLadder) {
        firstPlayer.ladderWinCount++;
        secondPlayer.ladderLoseCount++;
      } else {
        firstPlayer.winCount++;
        secondPlayer.loseCount++;
      }
    } else {
      if (isLadder) {
        secondPlayer.ladderWinCount++;
        firstPlayer.ladderLoseCount++;
      } else {
        secondPlayer.winCount++;
        firstPlayer.loseCount++;
      }
    }
    await firstPlayer.save();
    await secondPlayer.save();

    await newRecord.save();
  }
}
