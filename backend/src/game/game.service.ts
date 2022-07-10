import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { CreateGameRoomDto, GetGameRoomsDto, GetGameUsersDto } from './dto/game.dto';
import { GameRoomEntity, } from './entity/game.entity';
import { GameGateway } from './game.gateway';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly gameGateway: GameGateway,
    ) { }
    gameRoomIdList: number[] = new Array(10000).fill(0);

    private gameRoomTable: GameRoomEntity[] = [];

    getGameRoomPrimaryId(): number {
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

    getGameRooms(): GetGameRoomsDto[] {
        const getGameRoomsDtoArray = new Array<GetGameRoomsDto>;
        for (const item of this.gameRoomTable) {
            const getGameRoomsDto = new GetGameRoomsDto();
            getGameRoomsDto.gameId = item.gameId;
            getGameRoomsDto.roomTitle = item.roomTitle;
            getGameRoomsDto.playerCount = item.playerCount;
            getGameRoomsDto.isPublic = item.isPublic;
            getGameRoomsDto.isStart = item.isStart;
            getGameRoomsDtoArray.push(getGameRoomsDto);
        }
        return getGameRoomsDtoArray;
    }

    createGameRoom(createGameRoomDto: CreateGameRoomDto): string {
        // 서버 저장용

        const gameRoomEntity = new GameRoomEntity();
        gameRoomEntity.gameId = this.getGameRoomPrimaryId();
        gameRoomEntity.firstPlayer = createGameRoomDto.ownerId;
        gameRoomEntity.secondPlayer = null;
        gameRoomEntity.roomTitle = createGameRoomDto.roomTitle;
        gameRoomEntity.password = createGameRoomDto.password;
        gameRoomEntity.playerCount = 1;
        gameRoomEntity.isPublic = createGameRoomDto.password == '' ? false : true;
        gameRoomEntity.isStart = false;
        this.gameRoomTable.push(gameRoomEntity);

        return gameRoomEntity.roomTitle;
    }

    getGameRoomIndex(gameId: number, array: any) {
        for (const item of array) {
            if (item.gameId == gameId)
                return array.indexOf(item);
        }
        return null;
    }

    async enterGameRoom(
        gameId: number, 
        userId: number, 
        gamePassword: string | null,
        ): Promise<string> {
            const index = this.getGameRoomIndex(gameId, this.gameRoomTable);
        if (index == null)
            throw new BadRequestException('방 정보를 찾을 수 없습니다.');
        if (await this.gameRoomTable[index].password != gamePassword) {
            throw new BadRequestException('게임방의 비밀번호가 일치하지 않습니다.');
        }
        // 2P 입장
        if (this.gameRoomTable[index].secondPlayer == null) {
            this.gameRoomTable[index].secondPlayer = userId;

            const gameUsers = await this.getGameUsers(gameId);
            this.gameGateway.server
                .to(gameId.toString())
                .emit('updateGameUserList', gameUsers);
        }
        // 관전자 입장
        this.gameRoomTable[index].playerCount++;
        return this.gameRoomTable[index].roomTitle;
    }

    async exitGameRoom(gameId: number, userId: number): Promise<string> {
        const index = this.getGameRoomIndex(gameId, this.gameRoomTable);
        if (index == null)
            throw new BadRequestException('방 정보를 찾을 수 없습니다.');
        if (userId == this.gameRoomTable[index].firstPlayer) {
            // 1P가 나가면 방 폭파
            const deleteGameId = this.gameRoomTable[index].gameId;
            this.gameRoomIdList[deleteGameId] = 0;
            this.gameRoomTable.splice(index, 1);

            this.gameGateway.server
                .to(gameId.toString())
                .emit('deleteGameRoom', "boom!");
        }
        else if (userId == this.gameRoomTable[index].secondPlayer) {
            this.gameRoomTable[index].secondPlayer = null;
            const gameUsers = await this.getGameUsers(gameId);
            this.gameGateway.server
                .to(gameId.toString())
                .emit('updateGameUserList', gameUsers);
        }
        this.gameRoomTable[index].playerCount--;
        return this.gameRoomTable[index].roomTitle;
    }

    async getGameUsers(gameId: number): Promise<GetGameUsersDto[]> {
        const GameUsers = [];
        const index = this.getGameRoomIndex(gameId, this.gameRoomTable);
        if (index == null)
            throw new BadRequestException('방 정보를 찾을 수 없습니다.');

        const gameRoom = this.gameRoomTable[index];

        const firstPlayer = gameRoom.firstPlayer;
        const firstPlayerInfo = await this.userRepo.findOneBy({ id: firstPlayer });
        const firstPalyerDto = new GetGameUsersDto();
        firstPalyerDto.nickname = firstPlayerInfo.nickname;
        firstPalyerDto.avatar = firstPlayerInfo.avatar;
        firstPalyerDto.winCount = firstPlayerInfo.winCount;
        firstPalyerDto.loseCount = firstPlayerInfo.loseCount;
        GameUsers.push(firstPalyerDto);

        if (gameRoom.secondPlayer !== null) {
            const secondPlayer = gameRoom.secondPlayer;
            const secondPlayerInfo = await this.userRepo.findOneBy({ id: secondPlayer });
            const secondPalyerDto = new GetGameUsersDto();
            secondPalyerDto.nickname = secondPlayerInfo.nickname;
            secondPalyerDto.avatar = secondPlayerInfo.avatar;
            secondPalyerDto.winCount = secondPlayerInfo.winCount;
            secondPalyerDto.loseCount = secondPlayerInfo.loseCount;
            GameUsers.push(secondPalyerDto);
        }

        return GameUsers;
    }
}
