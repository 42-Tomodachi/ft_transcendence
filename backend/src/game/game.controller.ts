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
import { GamerInfoDto } from '../users/dto/users.dto';
import {
  CreateGameRoomDto,
  GameRoomPasswordDto,
  GameRoomProfileDto,
  GameResultDto,
  GameRoomIdDto,
  SimpleGameRoomDto,
} from './dto/game.dto';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';

@ApiTags('games')
@Controller('games')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard())
export class GameController {
  constructor(
    private gameService: GameService,
    private gameGateway: GameGateway,
  ) {}

  @ApiOperation({ summary: 'seungyel✅ 게임방 목록 가져오기' })
  @Get('/')
  getGameRooms(): GameRoomProfileDto[] {
    return this.gameService.getGameRoomList();
  }

  @ApiOperation({ summary: 'seungyel✅ 게임방 만들기' })
  @Post('/:userId')
  createGameRoom(
    @GetJwtUser() user: User,
    @Param('userId') userId: number,
    @Body() createGameRoomDto: CreateGameRoomDto,
  ): SimpleGameRoomDto {
    const gameRoom = this.gameService.createGameRoom(
      this.gameGateway,
      user,
      createGameRoomDto,
    );
    return gameRoom;
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
  ): Promise<GameRoomIdDto> {
    return await this.gameService.enterGameRoom(
      this.gameGateway,
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
    await this.gameService.exitGameRoom(this.gameGateway, user, gameId, userId);
  }

  // @ApiOperation({ summary: 'seungyel✅ 게임 전적 반영' })
  // @Post('/result')
  // async saveGameRecord(
  //   @Body() gameRecordSaveDto: GameResultDto,
  // ): Promise<void> {
  //   await this.gameService.saveGameRecord(gameRecordSaveDto);
  // }
}
