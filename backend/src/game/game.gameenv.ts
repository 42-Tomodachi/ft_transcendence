import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { randomInt } from 'crypto';
import {
  CreateGameRoomDto,
  GameResultDto,
  GameRoomProfileDto,
} from './dto/game.dto';
import { GameGateway } from './game.gateway';

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

export class Player {
  socket: Socket;
  userId: number;
  gameId: number | null;
  games: GameRoomAttribute[];
  inRoom: boolean;
  inLadderQ: boolean;

  constructor(socket: Socket, userId: number, gameId: number | null) {
    this.socket = socket;
    this.userId = userId;
    this.gameId = gameId;
    this.games = [];
    this.inRoom = false;
    this.inLadderQ = false;
  }
}

class GameRTData {
  ball_pos: [number, number];
  ball_vec: [number, number];
  paddle_L_pos: number;
  paddle_R_pos: number;
  turn: number;
  lostPoint: boolean;
  updateLeft: boolean;
  updateRight: boolean;
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
    this.updateLeft = true;
    this.updateRight = true;
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
      this.updateLeft = true;
    } else {
      this.paddle_R_pos = data.rightPaddlePos;
      this.updateRight = true;
    }
    this.lostPoint = data.checkPoint;
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
    return this.updateLeft == true && this.updateRight == true;
  }
}

export class GameRoomAttribute {
  roomId: number;
  roomTitle: string;
  password: string | null;
  gameMode: 'normal' | 'speed' | 'obstacle';
  firstPlayer: Player;
  secondPlayer: Player | null;
  spectators: Player[];
  playerCount: number;
  isPublic: boolean;
  isStart: boolean;
  rtData: GameRTData;
  streaming: NodeJS.Timer | null;

  constructor(
    roomId: number,
    createGameRoomDto: CreateGameRoomDto,
    player1: Player,
  ) {
    this.roomId = roomId;
    this.roomTitle = createGameRoomDto.roomTitle;
    this.password = createGameRoomDto.password;
    this.gameMode = createGameRoomDto.gameMode;
    this.firstPlayer = player1;
    this.secondPlayer = null;
    this.spectators = [];
    this.isStart = false;
    this.rtData = new GameRTData();
    this.playerCount = 1;
    this.isPublic = createGameRoomDto.password ? true : false;
    this.streaming = null;
  }

  toGameRoomProfileDto(): GameRoomProfileDto {
    const gameRoomProfileDto = new GameRoomProfileDto();
    gameRoomProfileDto.gameId = this.roomId;
    gameRoomProfileDto.roomTitle = this.roomTitle;
    gameRoomProfileDto.playerCount = this.playerCount;
    gameRoomProfileDto.isPublic = this.isPublic;
    gameRoomProfileDto.isStart = this.isStart;

    return gameRoomProfileDto;
  }

  toGameResultDto(): GameResultDto {
    const gameResultDto = new GameResultDto();
    gameResultDto.isLadder =
      this.password == null && this.isPublic == false ? true : false;
    gameResultDto.playerOneId = this.firstPlayer.userId;
    gameResultDto.playerTwoId = this.secondPlayer.userId;
    gameResultDto.playerOneScore = this.rtData.scoreLeft;
    gameResultDto.playerTwoScore = this.rtData.scoreRight;
    gameResultDto.winnerId =
      this.rtData.scoreLeft > this.rtData.scoreRight
        ? this.firstPlayer.userId
        : this.secondPlayer.userId;

    return gameResultDto;
  }

  enroll(gameRoomTable: GameRoomAttribute[]) {
    if (gameRoomTable.length == this.roomId) {
      gameRoomTable.push(this);
    } else {
      gameRoomTable[this.roomId] = this;
    }
  }

  updateRtData(data: GameInfo) {
    this.rtData.updateRtData(data);
  }

  updatePaddleRtData(data: number) {
    this.rtData.updatePaddleRtData(data);
  }

  streamRtData(gateway: GameGateway) {
    const currentTime = Date.now();
    const rtData = this.rtData;
    if (currentTime - rtData.lastSent < 15) {
      return;
    }
    if (rtData.isReadyToSend() == false) {
      return;
    }
    // console.log(`sending ${rtData.toRtData()}`); // this line test only
    // rtLogger.log(500, `sending ${rtData.toRtData()}`);
    gateway.server.to(this.roomId.toString()).emit('rtData', rtData.toRtData());
    rtData.lastSent = currentTime;
    rtData.updateLeft = false;
    rtData.updateRight = false;
  }

  gameStart(gateway: GameGateway) {
    this.isStart = true;
    this.streamRtData(gateway);
  }

  gameStop() {
    clearInterval(this.streaming);
  }

  isFinished(): boolean {
    return this.rtData.scoreLeft >= 10 || this.rtData.scoreRight >= 10;
  }
}

@Injectable()
export class GameEnv {
  gameRoomIdList: number[] = new Array(10).fill(0);
  gameRoomTable: GameRoomAttribute[] = [];
  playerList: Player[] = new Array(50).fill(0);
  ladderQueue: Player[] = [];

  getFreeRoomIndex(): number | null {
    let index = 0;

    for (const x of this.gameRoomIdList) {
      if (x == 0) {
        this.gameRoomIdList[index] = 1;
        return index;
      }
      index++;
    }
    return null;
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

  createGameRoom(createGameRoomDto: CreateGameRoomDto): number | null {
    const index: number = this.getFreeRoomIndex();
    if (index == null) {
      return null;
    }
    const player = this.getPlayerById(createGameRoomDto.ownerId);

    const gameRoomAtt = new GameRoomAttribute(index, createGameRoomDto, player);
    gameRoomAtt.enroll(this.gameRoomTable);
    player.inRoom = true;
    return index;
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
    game.firstPlayer.gameId = null;
    game.firstPlayer.inRoom = false;
    game.secondPlayer.gameId = null;
    game.secondPlayer.inRoom = false;
    for (const player of game.spectators) {
      player.gameId = null;
      player.inRoom = false;
    }
    const index = this.gameRoomTable.indexOf(game);
    this.gameRoomTable.splice(index, 1);
  }

  leaveGameRoom(
    game: GameRoomAttribute,
    player: Player,
  ): 'clear' | 'okay' | 'failed' {
    if (game.roomId != player.gameId) {
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

  newPlayer(socket: Socket, userId: number, gameId: number): Player | null {
    for (const player of this.playerList) {
      if (player.userId == userId) {
        return null;
      }
    }
    const newOne = new Player(socket, userId, gameId);
    this.playerList.push(newOne);
    return newOne;
  }

  removePlayer(player: Player) {
    if (player.inRoom) {
      this.leaveGameRoom(this.getGameRoom(player.gameId), player);
    }
    if (player.inLadderQ) {
      this.removeFromLadderQueue(player);
    }
    this.playerList.splice(this.playerList.indexOf(player), 1);
  }

  getPlayerById(userId: number): Player {
    return this.playerList.find((player) => {
      player.userId == userId;
    });
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

    const gameRoomAtt = new GameRoomAttribute(
      index,
      createGameRoomDto,
      player1,
    );
    gameRoomAtt.secondPlayer = player2;
    gameRoomAtt.playerCount = 2;
    gameRoomAtt.isPublic = false;

    gameRoomAtt.enroll(this.gameRoomTable);

    player1.gameId = index;
    player2.gameId = index;
    player1.socket.join(index.toString());
    player2.socket.join(index.toString());

    return gameRoomAtt;
  }
}
