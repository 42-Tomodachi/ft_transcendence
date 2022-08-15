import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { randomInt } from 'crypto';
import {
  CreateGameRoomDto,
  GameResultDto,
  GameRoomProfileDto,
} from './dto/game.dto';
import { GameGateway } from './game.gateway';
import { User } from 'src/users/entities/users.entity';

export interface GameInfo {
  ballP_X: number;
  ballP_Y: number;
  ballVelo_X: number;
  ballVelo_Y: number;
  leftPaddlePos: number;
  rightPaddlePos: number;
  player: number;
  turn: number;
  myScore: number;
  otherScore: number;
  checkPoint: boolean;
}

// export class Player {
//   user: User;
// }
export class Player {
  socket: Socket[];
  userId: number;
  gamePlaying: GameRoomAttribute;
  gamesWatching: GameRoomAttribute[];
  inRoom: boolean;
  inLadderQ: boolean;

  constructor(socket: Socket, userId: number, game: GameRoomAttribute) {
    this.socket = [];
    if (socket) this.socket.push(socket);
    this.userId = userId;
    this.gamePlaying = game;
    this.gamesWatching = [];
    this.inRoom = false;
    this.inLadderQ = false;
  }

  setGamePlaying(game: GameRoomAttribute): void {
    this.gamePlaying = game;
    if (!this.gamePlaying && !this.gamesWatching.length) this.inRoom = false;
    else this.inRoom = true;
  }

  addWatchingGame(game: GameRoomAttribute): void {
    this.gamesWatching.push(game);
    this.inRoom = true;
  }

  eraseWatchingGame(game: GameRoomAttribute): void {
    const index = this.gamesWatching.indexOf(game);
    this.gamesWatching.splice(index, 1);
    if (!this.gamePlaying && !this.gamesWatching.length) this.inRoom = false;
  }
}

class GameRTData {
  ball_pos: [number, number];
  ball_vec: [number, number];
  paddle_L_pos: number;
  paddle_R_pos: number;
  turn: number;
  lostPoint: boolean;
  updateFlag: boolean;
  scoreLeft: number;
  scoreRight: number;
  lastSent: number;

  constructor() {
    this.ball_pos = [50, 50];
    this.ball_vec = [1, 0];
    this.paddle_L_pos = 0;
    this.paddle_R_pos = 0;
    this.turn = randomInt(2) + 1;
    this.lostPoint = false;
    this.updateFlag = true;
    this.scoreLeft = 0;
    this.scoreRight = 0;
    this.lastSent = Date.now();
  }

  toRtData(): (number | boolean)[] {
    const data = [
      this.ball_pos[0],
      this.ball_pos[1],
      this.ball_vec[0],
      this.ball_vec[1],
      this.paddle_L_pos,
      this.paddle_R_pos,
      this.turn,
      this.lostPoint,
      this.scoreLeft,
      this.scoreRight,
    ];

    return data;
  }

  toScoreData(): number[] {
    return [this.scoreLeft, this.scoreRight];
  }

  updateScore() {
    if (this.lostPoint == false) {
      return;
    }
    if (this.turn == 1) {
      this.scoreLeft += 1;
    } else {
      this.scoreRight += 1;
    }
    this.lostPoint = false;
  }

  updateRtData(data: GameInfo) {
    this.ball_pos = [data.ballP_X, data.ballP_Y];
    this.ball_vec = [data.ballVelo_X, data.ballVelo_Y];
    this.turn = data.turn;
    if (this.turn == 1) {
      this.paddle_L_pos = data.leftPaddlePos;
    } else {
      this.paddle_R_pos = data.rightPaddlePos;
    }
    this.lostPoint = data.checkPoint;
    this.updateFlag = true;
    this.updateScore();
  }

  updatePaddleRtData(data: number) {
    if (this.turn == 1) {
      this.paddle_R_pos = data;
    } else {
      this.paddle_L_pos = data;
    }
  }

  isReadyToSend(): boolean {
    const currentTime = Date.now();
    const result = this.updateFlag == true && currentTime - this.lastSent > 15;
    if (result === true) this.lastSent = currentTime;
    return result;
  }
}

export class GameRoomAttribute {
  roomId: number;
  ownerId: number;
  roomTitle: string;
  password: string | null;
  gameMode: 'normal' | 'speed' | 'obstacle';
  firstPlayer: Player | null;
  secondPlayer: Player | null;
  spectators: Player[];
  playerCount: number;
  isPublic: boolean;
  isPlaying: boolean;
  rtData: GameRTData;
  streaming: NodeJS.Timer | null;

  constructor(
    roomId: number,
    createGameRoomDto: CreateGameRoomDto,
    player1: Player,
  ) {
    this.roomId = roomId;
    this.roomTitle = createGameRoomDto.roomTitle;
    this.ownerId = createGameRoomDto.ownerId;
    this.password = createGameRoomDto.password;
    this.gameMode = createGameRoomDto.gameMode;
    this.firstPlayer = player1;
    this.secondPlayer = null;
    this.spectators = [];
    this.playerCount = player1 ? 1 : 0;
    this.isPublic = !createGameRoomDto.password ? true : false;
    this.isPlaying = false;
    this.rtData = new GameRTData();
    this.streaming = null;
  }

  toGameRoomProfileDto(): GameRoomProfileDto {
    const gameRoomProfileDto = new GameRoomProfileDto();
    gameRoomProfileDto.gameId = this.roomId;
    gameRoomProfileDto.roomTitle = this.roomTitle;
    gameRoomProfileDto.playerCount = this.playerCount;
    gameRoomProfileDto.isPublic = this.isPublic;
    gameRoomProfileDto.isStart = this.isPlaying;

    return gameRoomProfileDto;
  }

  toGameResultDto(): GameResultDto {
    const gameResultDto = new GameResultDto();
    gameResultDto.isLadder = this.isLadder();
    gameResultDto.playerOneId = this.firstPlayer.userId;
    gameResultDto.playerTwoId = this.secondPlayer.userId;
    gameResultDto.playerOneScore = this.rtData.scoreLeft;
    gameResultDto.playerTwoScore = this.rtData.scoreRight;
    gameResultDto.winnerId = this.getWinner().userId;

    return gameResultDto;
  }

  isLadder(): boolean {
    return !this.password && !this.isPublic;
  }

  getWinner(): Player {
    if (this.isPlaying) return null;
    return this.rtData.scoreLeft > this.rtData.scoreRight
      ? this.firstPlayer
      : this.secondPlayer;
  }

  getAllPlayers(): Player[] {
    const players = this.spectators;
    players.unshift(this.secondPlayer);
    players.unshift(this.firstPlayer);
    return players;
  }

  initGameData(): void {
    this.isPlaying = false;
    delete this.rtData;
    this.rtData = new GameRTData();
  }

  updateRtData(data: GameInfo) {
    this.rtData.updateRtData(data);
  }

  updatePaddleRtData(data: number) {
    this.rtData.updatePaddleRtData(data);
  }

  streamRtData(gateway: GameGateway) {
    const rtData = this.rtData;
    if (rtData.isReadyToSend() == false) {
      return;
    }
    // console.log(`sending ${rtData.toRtData()}`); // this line test only
    // rtLogger.log(500, `sending ${rtData.toRtData()}`);
    gateway.server.to(this.roomId.toString()).emit('rtData', rtData.toRtData());
    rtData.updateFlag = false;
  }

  gameStart(gateway: GameGateway) {
    this.isPlaying = true;
    this.streamRtData(gateway);
  }

  isFinished(): boolean {
    return this.rtData.scoreLeft >= 10 || this.rtData.scoreRight >= 10;
  }
}

@Injectable()
export class GameEnv {
  gameRoomIdList: number[] = new Array(500).fill(0);
  gameRoomTable: GameRoomAttribute[] = [];
  playerList: Player[] = [];
  ladderQueue: Player[] = [];

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

  getRoomIndexOfGame(gameId: number): number | null {
    for (const item of this.gameRoomTable) {
      if (item.roomId == gameId) {
        return this.gameRoomTable.indexOf(item);
      }
    }
    return null;
  }

  checkGameRoomPassword(
    gameRoom: GameRoomAttribute,
    gamePassword: string,
  ): boolean {
    return gameRoom.password == gamePassword;
  }

  getGameRoom(gameId: number): GameRoomAttribute | null {
    return this.gameRoomTable.at(gameId);
  }

  createGameRoom(player: Player, createGameRoomDto: CreateGameRoomDto): number {
    const index: number = this.getFreeRoomIndex();

    const gameRoom = new GameRoomAttribute(index, createGameRoomDto, player);
    this.enrollGameToTable(gameRoom);

    player.setGamePlaying(gameRoom);
    return index;
  }

  enrollGameToTable(game: GameRoomAttribute): void {
    if (this.gameRoomTable.length == game.roomId) {
      this.gameRoomTable.push(game);
    } else {
      this.gameRoomTable[game.roomId] = game;
    }
  }

  setOwnerToCreatedRoom(player: Player, game: GameRoomAttribute): boolean {
    if (!player) return false;
    if (player.gamePlaying.roomId !== game.roomId) return false;

    if (game.ownerId !== player.userId) return false;

    game.firstPlayer = player;
    player.inRoom = true;
    return true;
  }

  joinGameRoom(
    player: Player,
    gameId: number,
    gamePassword: string,
  ): 'player' | 'spectator' {
    const game = this.getGameRoom(gameId);
    this.checkGameRoomPassword(game, gamePassword);

    player.inRoom = true;
    if (!game.secondPlayer) {
      game.secondPlayer = player;
      game.playerCount++;
      return 'player';
    } else {
      game.spectators.push(player);
      game.playerCount++;
      return 'spectator';
    }
  }

  gameRoomClear(game: GameRoomAttribute) {
    game.firstPlayer.setGamePlaying(null);
    game.secondPlayer?.setGamePlaying(null);
    for (const player of game.spectators) {
      player.eraseWatchingGame(game);
    }
    const index = this.gameRoomTable.indexOf(game);
    delete this.gameRoomTable[index];
    this.gameRoomTable.splice(index, 1);
    console.log(this.gameRoomTable); ///////////
  }

  leaveGameRoom(
    game: GameRoomAttribute,
    player: Player,
  ): 'clear' | 'okay' | 'failed' {
    if (game.roomId !== player.gamePlaying.roomId) {
      return 'failed';
    }

    if (game.firstPlayer == player) {
      this.gameRoomClear(game);
      return 'clear';
    } else if (game.secondPlayer == player) {
      game.secondPlayer = null;
    } else {
      game.spectators.splice(game.spectators.indexOf(player), 1);
    }
    player.inRoom = false;
    return 'okay';
  }

  postGameProcedure(game: GameRoomAttribute) {
    if (game.isLadder() === true) {
      this.gameRoomClear(game);
    } else {
      game.initGameData();
    }
    // clearInterval(this.streaming);
  }

  newPlayer(
    socket: Socket,
    userId: number,
    game: GameRoomAttribute,
  ): Player | null {
    for (const player of this.playerList) {
      if (player.userId == userId) {
        return player;
      }
    }
    const newOne = new Player(socket, userId, game);
    this.playerList.push(newOne);
    return newOne;
  }

  removePlayer(player: Player) {
    if (player.inRoom) {
      this.leaveGameRoom(player.gamePlaying, player);
    }
    if (player.inLadderQ) {
      this.removeFromLadderQueue(player);
    }
    this.playerList.splice(this.playerList.indexOf(player), 1);
  }

  getPlayerByUserId(userId: number): Player {
    const player = this.playerList.find((player) => {
      return player.userId === userId;
    });
    if (!player) return this.newPlayer(null, userId, null);
    else return player;
  }

  enlistLadderQueue(player: Player): GameRoomAttribute | null {
    this.ladderQueue.push(player);
    console.log(`enlistLadderQueue: length: ${this.ladderQueue.length}`);
    return this.makeLadderMatch();
  }

  removeFromLadderQueue(player: Player) {
    const index = this.ladderQueue.indexOf(player);
    this.ladderQueue.splice(index, 1);
  }

  makeLadderMatch(): GameRoomAttribute | null {
    if (this.ladderQueue.length < 2) {
      return null;
    }
    const player1 = this.ladderQueue.shift();
    const player2 = this.ladderQueue.shift();
    const index: number = this.getFreeRoomIndex();

    const createGameRoomDto = new CreateGameRoomDto();
    createGameRoomDto.roomTitle = `LadderGame${index}`;
    createGameRoomDto.password = null;
    createGameRoomDto.gameMode = 'normal';
    createGameRoomDto.ownerId = player1.userId;

    const gameRoom = new GameRoomAttribute(index, createGameRoomDto, player1);
    gameRoom.secondPlayer = player2;
    gameRoom.playerCount = 2;
    gameRoom.isPublic = false;

    this.enrollGameToTable(gameRoom);

    player1.gamePlaying = gameRoom;
    player2.gamePlaying = gameRoom;
    player1.socket[player1.socket.length - 1].join(index.toString());
    player2.socket[player2.socket.length - 1].join(index.toString());

    return gameRoom;
  }
}
