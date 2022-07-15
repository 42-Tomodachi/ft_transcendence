import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { GamerInfoDto as PlayerInfoDto } from '../users/dto/users.dto';
import { CreateGameRoomDto, GameRoomProfileDto } from './dto/game.dto';
import { GameGateway } from './game.gateway';

class GameRoomAttribute {
  roomId: number;
  roomTitle: string;
  password: string | null;
  gameMode: 'normal' | 'speed' | 'obstacle';
  playerCount: number;
  isPublic: boolean;
  isStart: boolean;
  firstPlayer: number;
  secondPlayer: number | null;
}

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly gameGateway: GameGateway,
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

  getGameRoomList(): GameRoomProfileDto[] {
    const gameRoomDtoArray: GameRoomProfileDto[] = [];
    console.log(this.gameRoomTable);
    for (const item of this.gameRoomTable) {
      if (!item) {
        continue;
      }
      const gameRoomDto = new GameRoomProfileDto();
      gameRoomDto.gameId = item.roomId;
      gameRoomDto.roomTitle = item.roomTitle;
      gameRoomDto.playerCount = item.playerCount;
      gameRoomDto.isPublic = item.isPublic;
      gameRoomDto.isStart = item.isStart;
      gameRoomDtoArray.push(gameRoomDto);
    }
    return gameRoomDtoArray;
  }

  createGameRoom(user: User, createGameRoomDto: CreateGameRoomDto): string {
    if (user.id !== createGameRoomDto.ownerId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    // 같은 유저가 게임방을 여럿 만들 수 없도록 수정

    const index: number = this.getFreeRoomIndex();

    const gameRoomAtt = new GameRoomAttribute();
    gameRoomAtt.roomId = index;
    gameRoomAtt.roomTitle = createGameRoomDto.roomTitle;
    gameRoomAtt.password = createGameRoomDto.password;
    gameRoomAtt.gameMode = createGameRoomDto.gameMode;
    gameRoomAtt.firstPlayer = createGameRoomDto.ownerId;
    gameRoomAtt.secondPlayer = null;
    gameRoomAtt.playerCount = 1;
    gameRoomAtt.isPublic = createGameRoomDto.password ? true : false;
    gameRoomAtt.isStart = false;
    if (this.gameRoomTable.length == index) {
      this.gameRoomTable.push(gameRoomAtt);
    } else {
      this.gameRoomTable[index] = gameRoomAtt;
    }

    return gameRoomAtt.roomTitle;
  }

  async getPlayersInfo(gameId: number): Promise<PlayerInfoDto[]> {
    const players: PlayerInfoDto[] = [];
    const index = this.getRoomIndexOfGame(gameId);
    if (index == null)
      throw new BadRequestException('방 정보를 찾을 수 없습니다.');

    const gameRoom = this.gameRoomTable[index];

    const firstPlayerUserId = gameRoom.firstPlayer;
    const firstPlayer = await this.userRepo.findOneBy({
      id: firstPlayerUserId,
    });
    players.push(firstPlayer.toGamerInfoDto());

    if (!gameRoom.secondPlayer) {
      return players;
    }

    const secondPlayerUserId = gameRoom.secondPlayer;
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
      this.gameRoomTable[index].secondPlayer = userId;

      // 소켓: 로비에 변경사항 반영
      // 소켓: 플레이어에 변경사항 전달
      const gameUsers = await this.getPlayersInfo(gameId);
      this.gameGateway.server
        .to(gameId.toString())
        .emit('updateGameUserList', gameUsers);
    } else {
      this.gameRoomTable[index].playerCount++;
      // 소켓: 관전자 설정
    }

    return this.gameRoomTable[index].roomTitle;
  }

  async exitGameRoom(
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
      case this.gameRoomTable[gameIndex].firstPlayer:
        this.gameRoomIdList[gameIndex] = 0;
        delete this.gameRoomTable[gameIndex];

        // 소켓: 로비 리스트 갱신
        this.gameGateway.server
          .to(gameId.toString())
          .emit('deleteGameRoom', 'boom!');
        break;
      case this.gameRoomTable[gameIndex].secondPlayer:
        this.gameRoomTable[gameIndex].secondPlayer = null;
        const gameUsers = await this.getPlayersInfo(gameId);
        this.gameGateway.server
          .to(gameId.toString())
          .emit('updateGameUserList', gameUsers);
        break;
      default:
        this.gameRoomTable[gameIndex].playerCount--;
      // 소켓: 관전자 설정
    }
  }
}
