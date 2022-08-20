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

@Injectable()
export class GameEnv {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  socketIdToPlayerMap = new Map<string, Player>();
  playerList: Player[] = [];
  gameLobbyTable: Socket[] = [];
  gameRoomIdList: number[] = new Array(500).fill(0);
  gameRoomTable: GameAttribute[] = [];
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

  getFreeRoomIndex(): number {
    let index = 0;

    for (const x of this.gameRoomIdList) {
      if (x == 0) {
        this.gameRoomIdList[index] = 1;
        return index;
      }
      index++;
    }
    return 0;
  }

  getGameRoom(gameId: number): GameAttribute {
    return this.gameRoomTable.at(gameId);
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

  //
  // socket connection managing methods
  // 소켓 연결 전에, 소켓을 제외한 모든 셋업은 api를 통해 처리되어 있어야 함.

  handleConnectionOnLobby(client: Socket, player: Player): void {
    this.gameLobbyTable.push(client);
    client.join('gameLobby');

    player.socketLobby = client;
  }

  handleConnectionOnLadderQueue(client: Socket, player: Player): void {
    player.socketQueue = client;
    this.enlistLadderQueue(player);
    // remove socket when no further connection
  }

  handleConnectionOnLadderGame(client: Socket, player: Player): void {
    const game = player.gamePlaying;
    player.socketPlayingGame = client;

    this.setSocketOnGame(client, game);
  }

  handleConnectionOnNormalGame(client: Socket, player: Player): void {
    let game: GameAttribute;
    const socketUnsettedGame = player.findGameHasUnsettedSocket();
    if (!socketUnsettedGame) {
      // game is for playing
      player.socketPlayingGame = client;
      game = player.gamePlaying;
    } else {
      // game is for watching
      game = socketUnsettedGame;
    }

    this.setSocketOnGame(client, game);
  }

  onFirstSocketHandshake(
    client: Socket,
    userId: number,
    connectionType: string,
  ): void {
    const player = this.assertGetPlayerBySocket(client, userId);
    this.socketIdToPlayerMap[client.id] = player;

    switch (connectionType) {
      case 'gameLobby':
        this.handleConnectionOnLobby(client, player);
        break;
      case 'ladderQueue':
        this.handleConnectionOnLadderQueue(client, player);
        break;
      case 'ladderGame':
        this.handleConnectionOnLadderGame(client, player);
        break;
      case 'normalGame':
        this.handleConnectionOnNormalGame(client, player);
        break;
      default:
        const message = `ConnectionHandler: ${connectionType} is not a correct type of connection.`;
        console.log(message);
        client.send(message);
    }
    console.log(`New client connected: ${client.id}`);
    client.send(`New client connected: ${client.id}`);
  }

  clearPlayerSocket(client: Socket): void {
    const player = this.socketIdToPlayerMap[client.id];
    if (player === undefined) return;

    if (player.socketLobby === client) player.socketLobby = null;
    else if (player.socketQueue === client) player.socketQueue = null;
    else if (player.socketPlayingGame === client)
      player.socketPlayingGame = null;

    if (player.inRoom === true) {
      this.leaveGameRoom(player.gamePlaying, player);
    }
    if (player.inLadderQ === true) {
      this.cancelLadderWaiting(client);
    }
    player.eraseASocket(client);
    this.eraseFromSocketMap(client);

    // 해당 유저 퇴장 알림
    // 유저 상태 접속중으로 변경
  }

  //
  // game managing methods

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

  setTimerOfRoomCancel(game: GameAttribute): NodeJS.Timer {
    return setTimeout(() => {
      this.gameRoomClear(game);
    }, 5000);
  }

  createGameRoom(player: Player, createGameRoomDto: CreateGameRoomDto): number {
    const index: number = this.getFreeRoomIndex();

    const gameRoom = new GameAttribute(index, createGameRoomDto, player);
    this.enrollGameToTable(gameRoom);

    player.setGamePlaying(gameRoom);
    return index;
  }

  enrollGameToTable(game: GameAttribute): void {
    if (this.gameRoomTable.length == game.roomId) {
      this.gameRoomTable.push(game);
    } else {
      this.gameRoomTable[game.roomId] = game;
    }
  }

  setOwnerToCreatedRoom(player: Player, game: GameAttribute): boolean {
    if (!player) return false;
    if (player.gamePlaying.roomId !== game.roomId) return false;

    if (game.ownerId !== player.userId) return false;

    game.firstPlayer = player;
    player.inRoom = true;
    return true;
  }

  checkGameRoomPassword(
    gameRoom: GameAttribute,
    gamePassword: string,
  ): boolean {
    return gameRoom.password == gamePassword;
  }

  setSocketOnGame(client: Socket, game: GameAttribute): void {
    if (!game) {
      console.log('setSocketonGame: game is undefined.');
      return;
    }
    client.join(game.roomId.toString());
  }

  joinPlayerToGame(player: Player, game: GameAttribute): number {
    if (!game.secondPlayer) {
      game.secondPlayer = player;
      player.setGamePlaying(game);
    } else {
      game.watchers.push(player);
      player.addWatchingGame(game);
    }
    game.playerCount++;
    game.isSocketUpdated = false;
    return game.playerCount;
  }

  gameRoomClear(game: GameAttribute): void {
    game.firstPlayer.setGamePlaying(null);
    game.secondPlayer?.setGamePlaying(null);
    for (const player of game.watchers) {
      player.eraseWatchingGame(game);
    }
    const index = this.gameRoomTable.indexOf(game);
    delete this.gameRoomTable[index];
    this.gameRoomTable.splice(index, 1);
  }

  leaveGameRoom(
    game: GameAttribute,
    player: Player,
  ): 'clear' | 'okay' | 'failed' {
    if (!game) {
      console.log('leaveGameRoom: no game');
      return 'failed';
    }
    if (game.roomId !== player.gamePlaying.roomId) {
      return 'failed';
    }

    if (game.firstPlayer == player) {
      this.gameRoomClear(game);
      return 'clear';
    } else if (game.secondPlayer == player) {
      game.secondPlayer = null;
    } else {
      game.watchers.splice(game.watchers.indexOf(player), 1);
    }
    player.inRoom = false;
    return 'okay';
  }

  postGameProcedure(game: GameAttribute): void {
    if (game.isLadder() === true) {
      this.gameRoomClear(game);
    } else {
      game.initGameData();
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

    client.disconnect();
  }

  makeLadderMatch(): GameAttribute {
    if (this.ladderQueue.length < 2) {
      return undefined;
    }
    const player1 = this.ladderQueue.shift();
    const player2 = this.ladderQueue.shift();
    const gameNumber = this.getFreeRoomIndex();

    const createGameRoomDto = new CreateGameRoomDto();
    createGameRoomDto.roomTitle = `LadderGame${gameNumber}`;
    createGameRoomDto.password = null;
    createGameRoomDto.gameMode = 'speed';
    createGameRoomDto.ownerId = player1.userId;

    const gameRoom = new GameAttribute(gameNumber, createGameRoomDto, player1);
    gameRoom.secondPlayer = player2;
    gameRoom.playerCount = 2;
    gameRoom.isPublic = false;

    this.enrollGameToTable(gameRoom);
    console.log(`Ladder match made: ${player1.userId}, ${player2.userId}`);

    player1.gamePlaying = gameRoom;
    player2.gamePlaying = gameRoom;
    player1.socketQueue.emit('matchingGame', gameRoom.roomId.toString());
    player2.socketQueue.emit('matchingGame', gameRoom.roomId.toString());

    return gameRoom;
  }

  async waitForPlayerJoins(client: Socket): Promise<void> {
    const player = this.getPlayerBySocket(client);
    const game = player.gamePlaying;

    const player1asUser: User = await this.userRepo.findOne({
      where: { id: game.firstPlayer.userId },
    });
    const player2asUser: User = game.secondPlayer
      ? await this.userRepo.findOne({
          where: { id: game.secondPlayer.userId },
        })
      : undefined;

    game.broadcastToRoom(
      'matchData',
      player1asUser.toGamerInfoDto(),
      player2asUser?.toGamerInfoDto(),
    );

    if (player2asUser) this.startGameCountdown(game);
  }

  async startGameCountdown(game: GameAttribute): Promise<void> {
    let counting = 5;
    game.broadcastToRoom('gameStartCount', `${counting}`);

    const timer: NodeJS.Timer = setInterval(() => {
      game.broadcastToRoom('gameStartCount', `${counting}`);
      counting--;
      if (counting < 0) {
        clearInterval(timer);
      }
    }, 1000);

    setTimeout(
      () => {
        this.startGame(game); // careful: async
      },
      5000,
      counting--,
    );
  }

  async startGame(game: GameAttribute): Promise<void> {
    if (!game || !game.secondPlayer) return;
    game.gameStart();

    const userP1 = await this.getUserByPlayer(game.firstPlayer);
    const userP2 = await this.getUserByPlayer(game.secondPlayer);
    userP1.userStatus = 'play';
    userP2.userStatus = 'play';
    await userP1.save();
    await userP2.save();
  }

  async processRecievedRtData(client: Socket, data: GameInfo): Promise<void> {
    const player: Player = this.getPlayerBySocket(client);
    const game = player.gamePlaying;

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
    this.postGameProcedure(game);
    game.broadcastToRoom('gameFinished');
    await this.writeMatchResult(game);

    const userP1 = await this.getUserByPlayer(game.firstPlayer);
    const userP2 = await this.getUserByPlayer(game.secondPlayer);
    userP1.userStatus = 'on';
    userP2.userStatus = 'on';
    await userP1.save();
    await userP2.save();
  }

  async writeMatchResult(game: GameAttribute): Promise<void> {
    const firstPlayer = await this.getUserByPlayer(game.firstPlayer);
    const secondPlayer = await this.getUserByPlayer(game.secondPlayer);
    if (!firstPlayer || !secondPlayer) {
      console.log('writeMatchResult: cannot get user from the database');
      return;
    }
    const winnerId = game.getWinner().userId;

    if (winnerId === firstPlayer.id) {
      if (game.isLadder) {
        firstPlayer.ladderWinCount++;
        secondPlayer.ladderLoseCount++;
      } else {
        firstPlayer.winCount++;
        secondPlayer.loseCount++;
      }
    } else {
      if (game.isLadder) {
        secondPlayer.ladderWinCount++;
        firstPlayer.ladderLoseCount++;
      } else {
        secondPlayer.winCount++;
        firstPlayer.loseCount++;
      }
    }
    await firstPlayer.save();
    await secondPlayer.save();

    const newRecord = new GameRecord();
    newRecord.playerOneId = game.firstPlayer.userId;
    newRecord.playerOneScore = game.rtData.scoreLeft;
    newRecord.playerTwoId = game.secondPlayer.userId;
    newRecord.playerTwoScore = game.rtData.scoreRight;
    newRecord.winnerId = winnerId;
    await newRecord.save();
  }
}
