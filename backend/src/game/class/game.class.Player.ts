import { Socket } from 'socket.io';
import { GameAttribute } from './game.class.GameAttribute';

export class Player {
  socketLobbySet: Set<Socket>;
  socketQueue: Socket;
  socketPlayingGame: Socket;
  socketsToGameMap: Map<Socket, GameAttribute>;
  userId: number;
  gamePlaying: GameAttribute;
  gamesWatching: Map<GameAttribute, Socket>;
  inLadderQ: boolean;
  isLeaving: boolean;

  constructor(userId: number, game: GameAttribute) {
    this.socketLobbySet = new Set();
    this.socketQueue = null;
    this.socketPlayingGame = null;
    this.socketsToGameMap = new Map<Socket, GameAttribute>();
    this.userId = userId;
    this.gamePlaying = game;
    this.gamesWatching = new Map<GameAttribute, Socket>();
    this.inLadderQ = false;
    this.isLeaving = false;
  }

  clear(): void {
    this.socketLobbySet.clear();
    this.socketQueue = null;
    this.socketPlayingGame = null;
    delete this.socketsToGameMap;
    this.socketsToGameMap = new Map<Socket, GameAttribute>();
    this.gamePlaying = null;
    delete this.gamesWatching;
    this.gamesWatching = new Map<GameAttribute, Socket>();
    this.inLadderQ = false;
  }

  setGameSocket(game: GameAttribute, socket: Socket): void {
    if (!game || !socket) {
      console.log(`setGameSocket: null game or socket`);
      return;
    }

    if (game === this.gamePlaying) {
      this.socketPlayingGame = socket;
      socket.join('playing');
    } else {
      this.gamesWatching.set(game, socket);
    }
    this.socketsToGameMap.set(socket, game);
  }

  unsetGameSocket(socket: Socket): void {
    const game = this.socketsToGameMap.get(socket);
    if (!game) return;

    socket.to(game.roomId.toString()).emit('playerDisconnected', this.userId);
    this.socketsToGameMap.delete(socket);
    if (socket === this.socketPlayingGame) this.socketPlayingGame = null;
    else this.gamesWatching.set(game, null);
  }

  joinGame(game: GameAttribute): boolean {
    if (!game) return false;
    if (!game.secondPlayer) {
      game.secondPlayer = this;
      this.gamePlaying = game;
    } else {
      game.watchers.add(this);
      this.gamesWatching.set(game, null);
    }
    game.playerCount++;
    game.isSocketUpdated = false;
    return true;
  }

  leaveGame(game: GameAttribute): boolean {
    if (this.isLeaving === true) return true;
    if (!game) {
      console.log('leaveGameRoom: no game');
      return false;
    }
    if (
      game.roomId !== this.gamePlaying?.roomId &&
      !this.gamesWatching.has(game)
    ) {
      console.log('leaveGameRoom: no target game');
      return false;
    }

    this.isLeaving = true;
    switch (this) {
      case game.firstPlayer:
        game.destroy();
        this.gamePlaying = null;
        this.socketsToGameMap.delete(this.socketPlayingGame);
        this.socketPlayingGame = null;
        break;
      case game.secondPlayer:
        this.gamePlaying = null;
        this.socketsToGameMap.delete(this.socketPlayingGame);
        this.socketPlayingGame = null;
        game.secondPlayer = null;
        game.playerCount--;
        if (game.isOnStartCount()) game.stopStartCount();
        game.broadcastToRoom('matchData', null, null);
        break;
      default:
        this.socketsToGameMap.delete(this.gamesWatching.get(game));
        this.gamesWatching.delete(game);
        game.playerCount--;
        game.watchers.delete(this);
    }
    this.isLeaving = false;
    return true;
  }

  findGameHasUnsettedSocket(): GameAttribute {
    for (const entry of this.gamesWatching.entries()) {
      if (entry[1] === null) return entry[0];
    }
    return undefined;
  }

  isJoinedGame(game: GameAttribute): boolean {
    return this.gamePlaying === game || this.gamesWatching.has(game);
  }
}
