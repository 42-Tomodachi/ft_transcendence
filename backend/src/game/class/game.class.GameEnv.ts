import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { CreateGameRoomDto } from '../dto/game.dto';
import { Player } from './game.class.Player';
import { GameAttribute } from './game.class.GameAttribute';

@Injectable()
export class GameEnv {
  gameRoomIdList: number[] = new Array(500).fill(0);
  gameRoomTable: GameAttribute[] = [];
  playerList: Player[] = [];
  ladderQueue: Player[] = [];

  getFreeRoomIndex(): number {
    let index = 0;

    for (const x of this.gameRoomIdList) {
      if (x == 0) {
        this.gameRoomIdList[index] = 1;
        return index;
      }
      index++;
    }
    return 0;
  }

  getRoomIndexOfGame(gameId: number): number | null {
    for (const item of this.gameRoomTable) {
      if (item.roomId == gameId) {
        return this.gameRoomTable.indexOf(item);
      }
    }
    return null;
  }

  checkGameRoomPassword(
    gameRoom: GameAttribute,
    gamePassword: string,
  ): boolean {
    return gameRoom.password == gamePassword;
  }

  getGameRoom(gameId: number): GameAttribute | null {
    return this.gameRoomTable.at(gameId);
  }

  setTimerOfRoomCancel(game: GameAttribute): NodeJS.Timer {
    return setTimeout(() => {
      this.gameRoomClear(game);
    }, 5000);
  }

  createGameRoom(player: Player, createGameRoomDto: CreateGameRoomDto): number {
    const index: number = this.getFreeRoomIndex();

    const gameRoom = new GameAttribute(index, createGameRoomDto, player);
    this.enrollGameToTable(gameRoom);

    player.setGamePlaying(gameRoom);
    return index;
  }

  enrollGameToTable(game: GameAttribute): void {
    if (this.gameRoomTable.length == game.roomId) {
      this.gameRoomTable.push(game);
    } else {
      this.gameRoomTable[game.roomId] = game;
    }
  }

  setOwnerToCreatedRoom(player: Player, game: GameAttribute): boolean {
    if (!player) return false;
    if (player.gamePlaying.roomId !== game.roomId) return false;

    if (game.ownerId !== player.userId) return false;

    game.firstPlayer = player;
    player.inRoom = true;
    return true;
  }

  joinGameRoom(
    player: Player,
    gameId: number,
    gamePassword: string,
  ): 'player' | 'spectator' {
    const game = this.getGameRoom(gameId);
    this.checkGameRoomPassword(game, gamePassword);

    player.inRoom = true;
    if (!game.secondPlayer) {
      game.secondPlayer = player;
      game.playerCount++;
      return 'player';
    } else {
      game.spectators.push(player);
      game.playerCount++;
      return 'spectator';
    }
  }

  gameRoomClear(game: GameAttribute) {
    game.firstPlayer.setGamePlaying(null);
    game.secondPlayer?.setGamePlaying(null);
    for (const player of game.spectators) {
      player.eraseWatchingGame(game);
    }
    const index = this.gameRoomTable.indexOf(game);
    delete this.gameRoomTable[index];
    this.gameRoomTable.splice(index, 1);
  }

  leaveGameRoom(
    game: GameAttribute,
    player: Player,
  ): 'clear' | 'okay' | 'failed' {
    if (game.roomId !== player.gamePlaying.roomId) {
      return 'failed';
    }

    if (game.firstPlayer == player) {
      this.gameRoomClear(game);
      return 'clear';
    } else if (game.secondPlayer == player) {
      game.secondPlayer = null;
    } else {
      game.spectators.splice(game.spectators.indexOf(player), 1);
    }
    player.inRoom = false;
    return 'okay';
  }

  postGameProcedure(game: GameAttribute) {
    if (game.isLadder() === true) {
      this.gameRoomClear(game);
    } else {
      game.initGameData();
    }
    // clearInterval(this.streaming);
  }

  newPlayer(
    socket: Socket,
    userId: number,
    game: GameAttribute,
  ): Player | null {
    for (const player of this.playerList) {
      if (player.userId == userId) {
        return player;
      }
    }
    const newOne = new Player(socket, userId, game);
    this.playerList.push(newOne);
    return newOne;
  }

  clearPlayerSocket(player: Player, socket: Socket) {
    if (player.inRoom) {
      this.leaveGameRoom(player.gamePlaying, player);
    }
    if (player.inLadderQ) {
      this.removeFromLadderQueue(player);
    }
    // this.playerList.splice(this.playerList.indexOf(player), 1);
    player.sockets.splice(player.sockets.indexOf(socket), 1);
  }

  getPlayerByUserId(userId: number): Player {
    const player = this.playerList.find((player) => {
      return player.userId === userId;
    });
    if (!player) return this.newPlayer(null, userId, null);
    else return player;
  }

  enlistLadderQueue(player: Player): GameAttribute | null {
    this.ladderQueue.push(player);
    console.log(`enlistLadderQueue: length: ${this.ladderQueue.length}`);
    return this.makeLadderMatch();
  }

  removeFromLadderQueue(player: Player) {
    const index = this.ladderQueue.indexOf(player);
    this.ladderQueue.splice(index, 1);
  }

  makeLadderMatch(): GameAttribute | null {
    if (this.ladderQueue.length < 2) {
      return null;
    }
    const player1 = this.ladderQueue.shift();
    const player2 = this.ladderQueue.shift();
    const index: number = this.getFreeRoomIndex();

    const createGameRoomDto = new CreateGameRoomDto();
    createGameRoomDto.roomTitle = `LadderGame${index}`;
    createGameRoomDto.password = null;
    createGameRoomDto.gameMode = 'normal';
    createGameRoomDto.ownerId = player1.userId;

    const gameRoom = new GameAttribute(index, createGameRoomDto, player1);
    gameRoom.secondPlayer = player2;
    gameRoom.playerCount = 2;
    gameRoom.isPublic = false;

    this.enrollGameToTable(gameRoom);

    player1.gamePlaying = gameRoom;
    player2.gamePlaying = gameRoom;
    player1.sockets[player1.sockets.length - 1].join(index.toString());
    player2.sockets[player2.sockets.length - 1].join(index.toString());

    return gameRoom;
  }
}
