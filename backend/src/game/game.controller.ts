import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateGameRoomDto, GetGameRoomsDto, GetGameUsersDto } from './dto/game.dto';
import { GameRoomEntity } from './entity/game.entity';
import { GameService } from './game.service';

@ApiTags('games')
@Controller('games')
export class GameController {
    constructor(private gameService: GameService) { }

    @ApiOperation({ summary: 'ulee 게임방 목록 가져오기' })
    @Get('/')
    getGameRooms(): GetGameRoomsDto[] {
        return this.gameService.getGameRooms();
    }

    @ApiOperation({ summary: 'ulee 게임방 참여자(플레이어) 정보 가져오기' })
    @Get('/:gameId/users')
    async getGameUsers(
        @Param('gameId', ParseIntPipe) gameId: number,
    ): Promise<GetGameUsersDto[]> {
        return this.gameService.getGameUsers(gameId);
    }

    @ApiOperation({ summary: 'ulee 게임방 만들기' })
    @Post('/')
    createGameRoom(
        @Body() createGameRoomDto: CreateGameRoomDto
    ): string {
        return this.gameService.createGameRoom(createGameRoomDto);
    }

    @ApiOperation({ summary: 'ulee 게임방 입장하기' })
    @Post('/:gameId/users/:userId')
    enterGameRoom(
        @Param('gameId', ParseIntPipe) gameId: number,
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<string> {
        return this.gameService.enterGameRoom(gameId, userId);
    }

    @ApiOperation({ summary: 'ulee 게임방 퇴장하기' })
    @Delete('/:gameId/users/:userId')
    exitGameRoom(
        @Param('gameId', ParseIntPipe) gameId: number,
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<string> {
        return this.gameService.exitGameRoom(gameId, userId);
    }

}
