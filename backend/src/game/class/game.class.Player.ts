import { Socket } from 'socket.io';
import { GameAttribute } from './game.class.GameAttribute';

export class Player {
  socketLobby: Socket;
  socketQueue: Socket;
  socketPlayingGame: Socket;
  socketsToGameMap: Map<Socket, GameAttribute>;
  userId: number;
  gamePlaying: GameAttribute;
  gamesWatching: Map<GameAttribute, Socket>;
  inRoom: boolean;
  inLadderQ: boolean;

  constructor(userId: number, game: GameAttribute) {
    this.socketLobby = null;
    this.socketQueue = null;
    this.socketPlayingGame = null;
    this.socketsToGameMap = new Map<Socket, GameAttribute>();
    this.userId = userId;
    this.gamePlaying = game;
    this.gamesWatching = new Map<GameAttribute, Socket>();
    this.inRoom = false;
    this.inLadderQ = false;
  }

  setGamePlaying(game: GameAttribute): void {
    this.gamePlaying = game;
    this.inRoom = game ? true : false;
  }

  addWatchingGame(game: GameAttribute): void {
    this.gamesWatching.set(game, null);
    this.inRoom = true;
  }

  leaveGame(game: GameAttribute): void {
    // do something
  }

  findGameHasUnsettedSocket(): GameAttribute {
    for (const entry of this.gamesWatching.entries()) {
      if (entry[1] === null) return entry[0];
    }
    return undefined;
  }

  eraseASocket(client: Socket): void {
    if (client === this.socketLobby) this.socketLobby = null;
    else if (client === this.socketPlayingGame) this.socketPlayingGame = null;
  }

  eraseWatchingGame(game: GameAttribute): void {
    this.gamesWatching.delete(game);
    if (!this.gamePlaying && !this.gamesWatching.size) this.inRoom = false;
  }

  eraseAGame(game: GameAttribute): void {
    if (this.gamePlaying === game) this.gamePlaying = null;
    else if (this.gamesWatching.has(game)) this.gamesWatching.delete(game);
    if (!this.gamePlaying && !this.gamesWatching.size) this.inRoom = false;
  }

  isJoinedRoom(game: GameAttribute): boolean {
    if (this.gamePlaying === game || this.gamesWatching.has(game)) return true;
    return false;
  }
}
