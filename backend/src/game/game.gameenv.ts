import { BadRequestException, Injectable } from '@nestjs/common';
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

  constructor(socket: Socket, userId: number, gameId: number | null) {
    this.socket = socket;
    this.userId = userId;
    this.gameId = gameId;
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
    this.updateScore();
    this.updateFlag = true;
  }

  updatePaddleRtData(data: number) {
    if (this.turn == 1) {
      this.paddle_R_pos = data;
    } else {
      this.paddle_L_pos = data;
    }
  }
}

export class GameRoomAttribute {
  roomId: number;
  roomTitle: string;
  password: string | null;
  gameMode: 'normal' | 'speed' | 'obstacle';
  firstPlayer: Player;
  secondPlayer: Player | null;
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

  save(gameRoomTable: GameRoomAttribute[]) {
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
    if (rtData.updateFlag === false) {
      return;
    }
    // console.log(`sending ${rtData.toRtData()}`); // this line test only
    // rtLogger.log(500, `sending ${rtData.toRtData()}`);
    gateway.server.to(this.roomId.toString()).emit('rtData', rtData.toRtData());
    rtData.lastSent = currentTime;
    rtData.updateFlag = false;
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
  gameRoomIdList: number[] = new Array(10000).fill(0);
  gameRoomTable: GameRoomAttribute[] = [];
  playerList: Player[] = new Array(10000).fill(0);
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
    throw new BadRequestException('생성 가능한 방 개수를 초과하였습니다.');
  }

  getRoomIndexOfGame(gameId: number): number {
    for (const item of this.gameRoomTable) {
      if (item.roomId == gameId) {
        return this.gameRoomTable.indexOf(item);
      }
    }
    return null;
  }

  getGameRoom(gameId: number): GameRoomAttribute {
    return this.gameRoomTable[gameId];
  }

  newPlayer(socket: Socket, userId: number, gameId: number): Player {
    const newOne = new Player(socket, userId, gameId);
    this.playerList.push(newOne);
    return newOne;
  }

  getPlayerById(userId: number): Player {
    return this.playerList.find((player) => {
      player.userId == userId;
    });
  }

  enlistLadderQueue(player: Player): GameRoomAttribute | null {
    this.ladderQueue.push(player);
    if (this.ladderQueue.length > 1) {
      console.log(`enlistLadderQueue: length: ${this.ladderQueue.length}`);
      return this.makeLadderMatch();
    } else {
      return null;
    }
  }

  removeFromLadderQueue(player: Player) {
    const index = this.ladderQueue.indexOf(player);
    this.ladderQueue.splice(index, 1);
  }

  makeLadderMatch(): GameRoomAttribute {
    // if (user.id !== createGameRoomDto.ownerId) {
    //   throw new BadRequestException('잘못된 유저의 접근입니다.');
    // }
    // 같은 유저가 게임방을 여럿 만들 수 없도록 수정
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

    gameRoomAtt.save(this.gameRoomTable);

    player1.gameId = index;
    player2.gameId = index;
    player1.socket.join(index.toString());
    player2.socket.join(index.toString());

    return gameRoomAtt;
  }
}
