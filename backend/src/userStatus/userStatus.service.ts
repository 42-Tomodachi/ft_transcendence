import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

class UserStatus {
  constructor(userId: number) {
    this.userId = userId;
    this.status = 'off';
    this.sockets = new Map();
    this.gameSockets = new Set();
  }
  userId: number;
  status: 'on' | 'off' | 'play';
  sockets: Map<string, Socket>;
  gameSockets: Set<Socket>;

  setChatLobbySocket(socket: Socket): void {
    if (!socket) {
      this.sockets.delete('chatLobby');
      return;
    }
    this.sockets.set('chatLobby', socket);
  }

  setGameLobbySocket(socket: Socket): void {
    if (!socket) {
      this.sockets.delete('gameLobby');
      return;
    }
    this.sockets.set('gameLobby', socket);
  }

  setChatRoomSocket(socket: Socket): void {
    if (!socket) {
      this.sockets.delete('chatRoom');
      return;
    }
    this.sockets.set('chatRoom', socket);
  }

  setGameRoomSocket(socket: Socket): void {
    this.gameSockets.add(socket);
  }

  removeGameRoomSocket(socket: Socket): void {
    this.gameSockets.delete(socket);
  }

  getSockets(): Socket[] {
    const found: Socket[] = [];

    for (const socket of this.sockets.values()) {
      found.push(socket);
    }
    for (const socket of this.gameSockets.values()) {
      found.push(socket);
    }
    return found;
  }

  changeStatus(): boolean {
    const lastStatus = this.status;

    if (this.gameSockets.size !== 0) this.status = 'play';
    else if (this.sockets.size !== 0) this.status = 'on';
    else this.status = 'off';

    return this.status !== lastStatus;
  }

  broadcastToLobbies(ev: string, ...args: any[]): void {
    const cLobby = this.sockets.get('chatLobby');
    const gLobby = this.sockets.get('gameLobby');

    if (cLobby) {
      gLobby.broadcast.emit(ev, ...args);
      gLobby.emit(ev, ...args);
      return;
    }
    if (gLobby) {
      gLobby.to('gameLobby').emit(ev, ...args);
      gLobby.emit(ev, ...args);
    }
  }
}

@Injectable()
export class UserStatusContainer {
  constructor() {
    for (let index = 0; index < 1000; index++) {
      this.userContainer[index] = new UserStatus(index);
    }
  }

  userContainer: UserStatus[] = new Array(1000);

  get(userId: number): UserStatus {
    return this.userContainer.at(userId);
  }

  getStatus(userId: number): 'on' | 'off' | 'play' {
    return this.get(userId).status;
  }

  getSockets(userId: number): Socket[] {
    return this.get(userId).getSockets();
  }

  // return: 유저상태 변경 여부
  setSocket(
    userId: number,
    socket: Socket,
    type: 'chatLobby' | 'chatRoom' | 'gameLobby' | 'gameRoom',
    rm?: boolean,
  ): boolean {
    switch (type) {
      case 'chatLobby':
        this.get(userId).setChatLobbySocket(socket);
        break;
      case 'chatRoom':
        this.get(userId).setChatRoomSocket(socket);
        break;
      case 'gameLobby':
        this.get(userId).setGameLobbySocket(socket);
        break;
      case 'gameRoom':
        if (rm === true) this.get(userId).removeGameRoomSocket(socket);
        else this.get(userId).setGameRoomSocket(socket);
        break;
    }
    return this.get(userId).changeStatus();
  }
}
