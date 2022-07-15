import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetJwtUser } from '../auth/jwt.strategy';
import { User } from '../users/entities/users.entity';
import { GameRecordSaveDto } from '../users/dto/gameRecord.dto';
import { GamerInfoDto } from '../users/dto/users.dto';
import {
  CreateGameRoomDto,
  GameRoomPasswordDto,
  GameRoomProfileDto,
} from './dto/game.dto';
import { GameService } from './game.service';

@ApiTags('games')
@Controller('games')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard())
export class GameController {
  constructor(private gameService: GameService) {}

  @ApiOperation({ summary: 'seungyel✅ 게임방 목록 가져오기' })
  @Get('/')
  getGameRooms(): GameRoomProfileDto[] {
    return this.gameService.getGameRoomList();
  }

  @ApiOperation({ summary: 'seungyel✅ 게임방 만들기' })
  @Post('/')
  createGameRoom(
    @GetJwtUser() user: User,
    @Body() createGameRoomDto: CreateGameRoomDto,
  ): string {
    return this.gameService.createGameRoom(user, createGameRoomDto);
  }

  @ApiOperation({ summary: 'seungyel✅ 게임방 참여자(플레이어) 정보 가져오기' })
  @Get('/:gameId/users')
  async getGameUsers(
    @Param('gameId', ParseIntPipe) gameId: number,
  ): Promise<GamerInfoDto[]> {
    return await this.gameService.getPlayersInfo(gameId);
  }

  @ApiOperation({ summary: 'seungyel✅ 게임방 입장하기' })
  @Post('/:gameId/users/:userId')
  async enterGameRoom(
    @GetJwtUser() user: User,
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() gamePasswordDto: GameRoomPasswordDto,
  ): Promise<string> {
    return await this.gameService.enterGameRoom(
      user,
      gameId,
      userId,
      gamePasswordDto.password,
    );
  }

  @ApiOperation({ summary: 'seungyel✅ 게임방 퇴장하기' })
  @Delete('/:gameId/users/:userId')
  async exitGameRoom(
    @GetJwtUser() user: User,
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    await this.gameService.exitGameRoom(user, gameId, userId);
  }

  @ApiOperation({ summary: 'seungyel 게임 전적 반영' })
  @Post('/reault')
  async gameRecord(
    @Body() gameRecordSaveDto: GameRecordSaveDto,
  ): Promise<void> {
    return await this.gameService.saveGameRecord(gameRecordSaveDto);
  }
}
