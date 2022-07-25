import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameRecord } from 'src/users/entities/gameRecord.entity';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { GamerInfoDto as PlayerInfoDto } from '../users/dto/users.dto';
import {
  CreateGameRoomDto,
  GameRoomProfileDto,
  GameResultDto,
} from './dto/game.dto';
import { GameGateway } from './game.gateway';
import { Socket } from 'socket.io';
import { randomInt } from 'crypto';

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

///////////////////

export interface GameInfo {
  ballP_X: number;
  ballP_Y: number;
  ballVelo_X: number;
  ballVelo_Y: number;
  myPaddlePos: number;
  otherPaddlePos: number;
  player: number;
  turn: number;
  myScore: number;
  otherScore: number;
  checkPoint: boolean;
}

//////////////////

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
    ];

    return data;
  }

  toScoreData(): string {
    let data: string;
    data += this.scoreLeft.toString() + ',';
    data += this.scoreRight.toString();

    return data;
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
      this.paddle_L_pos = data.myPaddlePos;
    } else {
      this.paddle_R_pos = data.myPaddlePos;
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

class GameRoomAttribute {
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

  updateRtData(data: GameInfo | number) {
    if (typeof data === 'number') {
      this.rtData.updatePaddleRtData(data);
    } else {
      this.rtData.updateRtData(data);
    }
    // this.rtData.updateRtData(data);
  }

  streamRtData(gateway: GameGateway) {
    const rtData = this.rtData;
    if (rtData.updateFlag === false) {
      return;
    }
    console.log(`sending ${rtData.toRtData()}`); // this line test only
    // gateway.server.to(game.roomId.toString()).emit('rtData', rtData.toRtData());
    gateway.server.emit('rtData', rtData.toRtData());
    rtData.updateFlag = false;
  }

  gameStart(gateway: GameGateway) {
    const streamTimer = setInterval(() => {
      this.streamRtData(gateway);
    }, 1000 / 60);
    this.streaming = streamTimer;
  }

  gameStop() {
    clearInterval(this.streaming);
  }

  isFinished(): boolean {
    return this.rtData.scoreLeft >= 10 || this.rtData.scoreRight >= 10;
  }
}

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  gameRoomIdList: number[] = new Array(10000).fill(0);
  private gameRoomTable: GameRoomAttribute[] = [];

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

  playerList: Player[] = new Array(10000).fill(0);

  ladderQueue: Player[] = [];

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

  // HTTP APIs

  getGameRoomList(): GameRoomProfileDto[] {
    const gameRoomDtoArray: GameRoomProfileDto[] = [];
    for (const item of this.gameRoomTable) {
      if (!item) {
        continue;
      }
      gameRoomDtoArray.push(item.toGameRoomProfileDto());
    }
    return gameRoomDtoArray;
  }

  createGameRoom(
    gateway: GameGateway,
    user: User,
    createGameRoomDto: CreateGameRoomDto,
  ) {
    if (user.id !== createGameRoomDto.ownerId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    // 같은 유저가 게임방을 여럿 만들 수 없도록 수정

    const index: number = this.getFreeRoomIndex();

    const gameRoomAtt = new GameRoomAttribute(
      index,
      createGameRoomDto,
      this.getPlayerById(user.id),
    );
    gameRoomAtt.save(this.gameRoomTable);

    // (소켓) 모든 클라이언트에 새로 만들어진 게임방이 있음을 전달
    // this.emitEvent('addGameList', gameRoomAtt.toGameRoomProfileDto());
  }

  async getPlayersInfo(gameId: number): Promise<PlayerInfoDto[]> {
    const players: PlayerInfoDto[] = [];
    const index = this.getRoomIndexOfGame(gameId);
    if (index == null)
      throw new BadRequestException('방 정보를 찾을 수 없습니다.');

    const gameRoom = this.gameRoomTable[index];

    const firstPlayerUserId = gameRoom.firstPlayer.userId;
    const firstPlayer = await this.userRepo.findOneBy({
      id: firstPlayerUserId,
    });
    players.push(firstPlayer.toGamerInfoDto());

    if (!gameRoom.secondPlayer) {
      return players;
    }

    const secondPlayerUserId = gameRoom.secondPlayer.userId;
    const secondPlayer = await this.userRepo.findOneBy({
      id: secondPlayerUserId,
    });
    players.push(secondPlayer.toGamerInfoDto());

    return players;
  }

  async enterGameRoom(
    gateway: GameGateway,
    user: User,
    gameId: number,
    userId: number,
    gamePassword: string | null,
  ): Promise<string> {
    const index = this.getRoomIndexOfGame(gameId);
    if (user.id != userId)
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    if (index == null)
      throw new BadRequestException('방 정보를 찾을 수 없습니다.');
    if (this.gameRoomTable[index].password != gamePassword) {
      throw new BadRequestException('게임방의 비밀번호가 일치하지 않습니다.');
    }

    // 동일 유저의 재입장 막아야함

    if (!this.gameRoomTable[index].secondPlayer) {
      this.gameRoomTable[index].secondPlayer = this.getPlayerById(userId);

      // (소켓) 모든 클라이언트에 새로 만들어진 게임방이 있음을 전달
      // this.emitEvent('renewGameRoom', gameRoomAtt.toGameRoomProfileDto());
      // 소켓: 로비에 변경사항 반영
      // 소켓: 플레이어에 변경사항 전달
      const gameUsers = await this.getPlayersInfo(gameId);
      gateway.server
        .to(gameId.toString())
        .emit('updateGameUserList', gameUsers);
    } else {
      this.gameRoomTable[index].playerCount++;
      // 소켓: 관전자 설정
    }

    return this.gameRoomTable[index].roomTitle;
  }

  async exitGameRoom(
    gateway: GameGateway,
    user: User,
    gameId: number,
    userId: number,
  ): Promise<void> {
    if (user.id != userId)
      throw new BadRequestException('잘못된 유저의 접근입니다.');

    const gameIndex = this.getRoomIndexOfGame(gameId);
    if (gameIndex == null)
      throw new BadRequestException('방 정보를 찾을 수 없습니다.');

    switch (userId) {
      case this.gameRoomTable[gameIndex].firstPlayer.userId:
        this.gameRoomIdList[gameIndex] = 0;
        delete this.gameRoomTable[gameIndex];

        // 소켓: 로비 리스트 갱신
        gateway.server.to(gameId.toString()).emit('deleteGameRoom', 'boom!');
        break;
      case this.gameRoomTable[gameIndex].secondPlayer.userId:
        this.gameRoomTable[gameIndex].secondPlayer = null;
        const gameUsers = await this.getPlayersInfo(gameId);
        gateway.server
          .to(gameId.toString())
          .emit('updateGameUserList', gameUsers);
        break;
      default:
        this.gameRoomTable[gameIndex].playerCount--;
      // 소켓: 관전자 설정
    }
  }

  async saveGameRecord(gameRecordSaveDto: GameResultDto): Promise<void> {
    const firstPlayer = await this.userRepo.findOneBy({
      id: gameRecordSaveDto.playerOneId,
    });
    const secondPlayer = await this.userRepo.findOneBy({
      id: gameRecordSaveDto.playerTwoId,
    });
    if (!firstPlayer || !secondPlayer) {
      throw new BadRequestException('유저 정보를 찾을 수 없습니다.');
    }
    if (gameRecordSaveDto.winnerId == gameRecordSaveDto.playerOneId) {
      if (gameRecordSaveDto.isLadder) {
        firstPlayer.ladderWinCount++;
        secondPlayer.ladderLoseCount++;
      } else {
        firstPlayer.winCount++;
        secondPlayer.loseCount++;
      }
    } else {
      if (gameRecordSaveDto.isLadder) {
        firstPlayer.ladderWinCount++;
        secondPlayer.ladderLoseCount++;
      } else {
        firstPlayer.winCount++;
        secondPlayer.loseCount++;
      }
    }
    const newRecord = new GameRecord();
    newRecord.playerOneId = gameRecordSaveDto.playerOneId;
    newRecord.playerOneScore = gameRecordSaveDto.playerOneScore;
    newRecord.playerTwoId = gameRecordSaveDto.playerTwoId;
    newRecord.playerTwoScore = gameRecordSaveDto.playerTwoScore;
    newRecord.winnerId = gameRecordSaveDto.winnerId;
    await newRecord.save();

    await firstPlayer.save();
    await secondPlayer.save();
  }
}
