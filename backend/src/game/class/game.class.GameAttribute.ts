import { BroadcastOperator } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import {
  CreateGameRoomDto,
  GameResultDto,
  GameRoomProfileDto,
} from '../dto/game.dto';
import { GameRtData } from './game.class.GameRtData';
import { GameInfo } from './game.class.interface';
import { Player } from './game.class.Player';

export class GameAttribute {
  roomId: number;
  ownerId: number;
  roomTitle: string;
  password: string | null;
  gameMode: 'normal' | 'speed' | 'obstacle';
  firstPlayer: Player | null;
  secondPlayer: Player | null;
  watchers: Player[];
  playerCount: number;
  isPublic: boolean;
  isPlaying: boolean;
  rtData: GameRtData;
  roomBroadcast: BroadcastOperator<DefaultEventsMap, any>;
  isSocketUpdated: boolean;
  streaming: NodeJS.Timer | null;

  constructor(
    roomId: number,
    createGameRoomDto: CreateGameRoomDto,
    player1: Player,
  ) {
    this.roomId = roomId;
    this.roomTitle = createGameRoomDto.roomTitle;
    this.ownerId = createGameRoomDto.ownerId;
    this.password = createGameRoomDto.password;
    this.gameMode = createGameRoomDto.gameMode;
    this.firstPlayer = player1;
    this.secondPlayer = null;
    this.watchers = [];
    this.playerCount = player1 ? 1 : 0;
    this.isPublic = !createGameRoomDto.password ? true : false;
    this.isPlaying = false;
    this.rtData = new GameRtData();
    this.roomBroadcast = null;
    this.isSocketUpdated = false;
    this.streaming = null;
  }

  toGameRoomProfileDto(): GameRoomProfileDto {
    const gameRoomProfileDto = new GameRoomProfileDto();
    gameRoomProfileDto.gameId = this.roomId;
    gameRoomProfileDto.roomTitle = this.roomTitle;
    gameRoomProfileDto.playerCount = this.playerCount;
    gameRoomProfileDto.isPublic = this.isPublic;
    gameRoomProfileDto.isStart = this.isPlaying;

    return gameRoomProfileDto;
  }

  toGameResultDto(): GameResultDto {
    const gameResultDto = new GameResultDto();
    gameResultDto.isLadder = this.isLadder();
    gameResultDto.playerOneId = this.firstPlayer.userId;
    gameResultDto.playerTwoId = this.secondPlayer.userId;
    gameResultDto.playerOneScore = this.rtData.scoreLeft;
    gameResultDto.playerTwoScore = this.rtData.scoreRight;
    gameResultDto.winnerId = this.getWinner().userId;

    return gameResultDto;
  }

  isLadder(): boolean {
    return !this.password && !this.isPublic;
  }

  getWinner(): Player {
    if (this.isPlaying) return null;
    return this.rtData.scoreLeft > this.rtData.scoreRight
      ? this.firstPlayer
      : this.secondPlayer;
  }

  getAllPlayers(): Player[] {
    const players = this.watchers;
    players.unshift(this.secondPlayer);
    players.unshift(this.firstPlayer);
    return players;
  }

  //   addPlayer(player: Player): number {
  //     if (!this.secondPlayer) {
  //       this.secondPlayer = player;
  //       player.setGamePlaying(this);
  //     } else {
  //       this.watchers.push(player);
  //       player.addWatchingGame(this);
  //     }
  //     this.playerCount++;
  //     this.isSocketUpdated = false;
  //     return this.playerCount;
  //   }

  initGameData(): void {
    this.isPlaying = false;
    delete this.rtData;
    this.rtData = new GameRtData();
  }

  updateRtData(data: GameInfo) {
    this.rtData.updateRtData(data);
  }

  updatePaddleRtData(data: number) {
    this.rtData.updatePaddleRtData(data);
  }

  sendRtData() {
    const rtData = this.rtData;
    if (rtData.isReadyToSend() == false) {
      return;
    }
    // console.log(`sending ${rtData.toRtData()}`); // this line test only
    // rtLogger.log(500, `sending ${rtData.toRtData()}`);
    this.roomBroadcast.emit('rtData', rtData.toRtData());
    rtData.updateFlag = false;
  }

  gameStart() {
    this.isPlaying = true;
    this.sendRtData();
  }

  isFinished(): boolean {
    return this.rtData.scoreLeft >= 10 || this.rtData.scoreRight >= 10;
  }
}
