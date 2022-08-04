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
  GameRoomIdDto,
  SimpleGameRoomDto,
} from './dto/game.dto';
import { GameGateway } from './game.gateway';
import { Socket } from 'socket.io';
import { GameEnv, GameRoomAttribute, Player } from './game.gameenv';

class RtLogger {
  lastLogged: number = Date.now();

  public log(interval: number, msg: string) {
    const currentTime = Date.now();
    if (this.lastLogged - currentTime < interval) {
      return;
    }
    console.log(msg);
    this.lastLogged = currentTime;
  }

  public resetTimer() {
    this.lastLogged = Date.now();
  }
}

const rtLogger = new RtLogger();

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly gameEnv: GameEnv,
  ) {}

  // HTTP APIs

  getGameRoomList(): GameRoomProfileDto[] {
    const gameRoomDtoArray: GameRoomProfileDto[] = [];
    for (const item of this.gameEnv.gameRoomTable) {
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
  ): SimpleGameRoomDto {
    if (user.id !== createGameRoomDto.ownerId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    // 같은 유저가 게임방을 여럿 만들 수 없도록 수정

    const index: number = this.gameEnv.getFreeRoomIndex();
    const player: Player = this.gameEnv.getPlayerById(user.id);

    const gameRoomAtt = new GameRoomAttribute(index, createGameRoomDto, player);
    gameRoomAtt.save(this.gameEnv.gameRoomTable);

    // (소켓) 모든 클라이언트에 새로 만들어진 게임방이 있음을 전달
    // this.emitEvent('addGameList', gameRoomAtt.toGameRoomProfileDto());

    const gameRoomDto = new SimpleGameRoomDto();
    gameRoomDto.gameMode = createGameRoomDto.gameMode;
    gameRoomDto.ownerId = createGameRoomDto.ownerId;
    gameRoomDto.roomTitle = createGameRoomDto.roomTitle;
    gameRoomDto.gameId = index;

    return gameRoomDto;
  }

  async getPlayersInfo(gameId: number): Promise<PlayerInfoDto[]> {
    const players: PlayerInfoDto[] = [];
    // const index = this.gameEnv.getRoomIndexOfGame(gameId);
    // if (index == null)
    //   throw new BadRequestException('방 정보를 찾을 수 없습니다.');

    const gameRoom = this.gameEnv.getGameRoom(gameId);
    if (!gameRoom) throw new BadRequestException('방 정보를 찾을 수 없습니다.');

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
  ): Promise<GameRoomIdDto> {
    const index = this.gameEnv.getRoomIndexOfGame(gameId);
    if (user.id != userId)
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    if (index == null)
      throw new BadRequestException('방 정보를 찾을 수 없습니다.');
    if (this.gameEnv.gameRoomTable[index].password != gamePassword) {
      throw new BadRequestException('게임방의 비밀번호가 일치하지 않습니다.');
    }

    // 동일 유저의 재입장 막아야함

    if (!this.gameEnv.gameRoomTable[index].secondPlayer) {
      this.gameEnv.gameRoomTable[index].secondPlayer =
        this.gameEnv.getPlayerById(userId);

      // (소켓) 모든 클라이언트에 새로 만들어진 게임방이 있음을 전달
      // this.emitEvent('renewGameRoom', gameRoomAtt.toGameRoomProfileDto());
      // 소켓: 로비에 변경사항 반영
      // 소켓: 플레이어에 변경사항 전달
      const gameUsers = await this.getPlayersInfo(gameId);
      gateway.server
        .to(gameId.toString())
        .emit('updateGameUserList', gameUsers);
    } else {
      this.gameEnv.gameRoomTable[index].playerCount++;
      // 소켓: 관전자 설정
    }
    // return this.gameEnv.gameRoomTable[index].roomTitle;
    return { gameId: gameId };
  }

  async exitGameRoom(
    gateway: GameGateway,
    user: User,
    gameId: number,
    userId: number,
  ): Promise<void> {
    if (user.id != userId)
      throw new BadRequestException('잘못된 유저의 접근입니다.');

    const gameIndex = this.gameEnv.getRoomIndexOfGame(gameId);
    if (gameIndex == null)
      throw new BadRequestException('방 정보를 찾을 수 없습니다.');

    switch (userId) {
      case this.gameEnv.gameRoomTable[gameIndex].firstPlayer.userId:
        this.gameEnv.gameRoomIdList[gameIndex] = 0;
        delete this.gameEnv.gameRoomTable[gameIndex];

        // 소켓: 로비 리스트 갱신
        gateway.server.to(gameId.toString()).emit('deleteGameRoom', 'boom!');
        break;
      case this.gameEnv.gameRoomTable[gameIndex].secondPlayer.userId:
        this.gameEnv.gameRoomTable[gameIndex].secondPlayer = null;
        const gameUsers = await this.getPlayersInfo(gameId);
        gateway.server
          .to(gameId.toString())
          .emit('updateGameUserList', gameUsers);
        break;
      default:
        this.gameEnv.gameRoomTable[gameIndex].playerCount--;
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
