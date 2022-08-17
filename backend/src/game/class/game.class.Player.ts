import { Socket } from 'socket.io';
import { GameAttribute } from './game.class.GameAttribute';

// export class Player {
//   user: User;
// }
export class Player {
  sockets: Socket[];
  userId: number;
  gamePlaying: GameAttribute;
  gamesWatching: GameAttribute[];
  inRoom: boolean;
  inLadderQ: boolean;

  constructor(socket: Socket, userId: number, game: GameAttribute) {
    this.sockets = [];
    if (socket) this.sockets.push(socket);
    this.userId = userId;
    this.gamePlaying = game;
    this.gamesWatching = [];
    this.inRoom = false;
    this.inLadderQ = false;
  }

  setGamePlaying(game: GameAttribute): void {
    this.gamePlaying = game;
    if (this.gamesWatching.length === 0) {
      this.inRoom = false;
    } else {
      this.inRoom = true;
    }
  }

  addWatchingGame(game: GameAttribute): void {
    this.gamesWatching.push(game);
    this.inRoom = true;
  }

  eraseWatchingGame(game: GameAttribute): void {
    const index = this.gamesWatching.indexOf(game);
    this.gamesWatching.splice(index, 1);
    if (!this.gamePlaying && !this.gamesWatching.length) this.inRoom = false;
  }

  isJoinedRoom(game: GameAttribute): boolean {
    if (this.gamePlaying === game || this.gamesWatching.indexOf(game) >= 0)
      return true;
    return false;
  }
}
