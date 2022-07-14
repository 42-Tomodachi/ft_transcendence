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
import { GetJwtUser } from 'src/auth/jwt.strategy';
import { User } from 'src/users/entities/users.entity';
import {
  CreateGameRoomDto,
  GameRoomPasswordDto,
  GetGameRoomsDto,
  GetGameUsersDto,
} from './dto/game.dto';
import { GameRoomEntity } from './entity/game.entity';
import { GameService } from './game.service';

@ApiTags('games')
@Controller('games')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard())
export class GameController {
  constructor(private gameService: GameService) {}

  @ApiOperation({ summary: 'seungyel✅ 게임방 목록 가져오기' })
  @Get('/')
  getGameRooms(): GetGameRoomsDto[] {
    return this.gameService.getGameRooms();
  }

  @ApiOperation({ summary: 'seungyel✅ 게임방 참여자(플레이어) 정보 가져오기' })
  @Get('/:gameId/users')
  async getGameUsers(
    @Param('gameId', ParseIntPipe) gameId: number,
  ): Promise<GetGameUsersDto[]> {
    return this.gameService.getGameUsers(gameId);
  }

  @ApiOperation({ summary: 'seungyel✅ 게임방 만들기' })
  @Post('/')
  createGameRoom(@Body() createGameRoomDto: CreateGameRoomDto): string {
    return this.gameService.createGameRoom(createGameRoomDto);
  }

  @ApiOperation({ summary: 'seungyel✅ 게임방 입장하기' })
  @Post('/:gameId/users/:userId')
  async enterGameRoom(
    @GetJwtUser() user: User,
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() gamePasswordDto: GameRoomPasswordDto,
  ): Promise<string> {
    return this.gameService.enterGameRoom(
      user,
      gameId,
      userId,
      gamePasswordDto.password,
    );
  }

  @ApiOperation({ summary: 'seungyel✅ 게임방 퇴장하기' })
  @Delete('/:gameId/users/:userId')
  exitGameRoom(
    @GetJwtUser() user: User,
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<string> {
    return this.gameService.exitGameRoom(user, gameId, userId);
  }
}
