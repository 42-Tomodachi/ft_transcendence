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
  SimpleGameRoomDto,
  ChallengeResponse,
} from './dto/game.dto';
import { GameGateway } from './game.gateway';
import { GameEnv } from './class/game.class.GameEnv';

// class RtLogger {
//   lastLogged: number = Date.now();

//   public log(interval: number, msg: string) {
//     const currentTime = Date.now();
//     if (this.lastLogged - currentTime < interval) {
//       return;
//     }
//     console.log(msg);
//     this.lastLogged = currentTime;
//   }

//   public resetTimer() {
//     this.lastLogged = Date.now();
//   }
// }

// const rtLogger = new RtLogger();

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
    for (const item of this.gameEnv.gameRoomList) {
      if (!item.active || item.isLadder) {
        continue;
      }
      gameRoomDtoArray.push(item.toGameRoomProfileDto());
    }
    return gameRoomDtoArray;
  }

  createGameRoom(
    user: User,
    createGameRoomDto: CreateGameRoomDto,
  ): SimpleGameRoomDto {
    if (user.id !== createGameRoomDto.ownerId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    const player = this.gameEnv.getPlayerByUserId(user.id);
    if (player.gamePlaying) {
      throw new BadRequestException('이미 게임을 생성한 유저입니다.');
    }

    const gameId = this.gameEnv.createGameRoom(player, createGameRoomDto);

    const gameRoomDto = new SimpleGameRoomDto();
    gameRoomDto.gameMode = createGameRoomDto.gameMode;
    gameRoomDto.ownerId = createGameRoomDto.ownerId;
    gameRoomDto.roomTitle = createGameRoomDto.roomTitle;
    gameRoomDto.gameId = gameId;

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
    user: User,
    gameId: number,
    userId: number,
    gamePassword: string | null,
  ): Promise<SimpleGameRoomDto> {
    if (user.id != userId)
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    const player = this.gameEnv.getPlayerByUserId(userId);
    if (!player) throw new BadRequestException('플레이어 정보가 없습니다.');
    const game = this.gameEnv.getGameRoom(gameId);
    if (game == null) throw new BadRequestException('게임을 찾을 수 없습니다.');
    if (game.password != gamePassword)
      throw new BadRequestException('잘못된 비밀번호.');
    if (player.isJoinedGame(game))
      throw new BadRequestException('이미 입장 된 방입니다.');

    const peopleCount = this.gameEnv.joinPlayerToGame(player, game);
    console.log(
      `Player ${player.userId} joined room ${game.roomId}, ${peopleCount}`,
    );
    // 소켓: 로비에 변경사항 반영

    const gameRoomDto = new SimpleGameRoomDto();
    gameRoomDto.gameMode = game.gameMode;
    gameRoomDto.ownerId = game.ownerId;
    gameRoomDto.roomTitle = game.roomTitle;
    gameRoomDto.gameId = gameId;

    return gameRoomDto;
  }

  async exitGameRoom(
    user: User,
    gameId: number,
    userId: number,
  ): Promise<void> {
    if (user.id != userId)
      throw new BadRequestException('잘못된 유저의 접근입니다.');

    const game = this.gameEnv.getGameRoom(gameId);
    if (game == null) {
      throw new BadRequestException('게임을 찾을 수 없습니다.');
    }

    switch (userId) {
      case game.firstPlayer.userId:
        game.destroy();
        // 소켓: 로비 리스트 갱신
        game.broadcastToRoom('deleteGameRoom', 'boom!');
        break;
      case game.secondPlayer.userId:
        game.secondPlayer.leaveGame(game);
      default:
        const gameUsers = await this.getPlayersInfo(gameId);
        game.broadcastToRoom('updateGameUserList', gameUsers);
      // 소켓: 관전자 설정
    }
  }

  async challengeDuel(
    user: User,
    userId: number,
    targetId: number,
  ): Promise<ChallengeResponse> {
    if (user.id != userId)
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    if (userId === targetId)
      throw new BadRequestException('잘못된 요청입니다.');

    if (false) {
      // 채팅소켓에서 연결할 수 없는 경우?
      return { available: false };
    }
    if (this.gameEnv.isDuelAvailable(targetId) === false) {
      return { available: false };
    }

    return { available: true };
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
        secondPlayer.ladderWinCount++;
        firstPlayer.ladderLoseCount++;
      } else {
        secondPlayer.winCount++;
        firstPlayer.loseCount++;
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
