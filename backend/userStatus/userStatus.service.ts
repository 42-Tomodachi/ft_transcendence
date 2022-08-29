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
      this.changeStatus();
      return;
    }
    this.sockets.set('gameLobby', socket);
    this.changeStatus();
  }

  setChatRoomSocket(socket: Socket): void {
    if (!socket) {
      this.sockets.delete('chatRoom');
      this.changeStatus();
      return;
    }
    this.sockets.set('chatRoom', socket);
    this.changeStatus();
  }

  setGameRoomSocket(socket: Socket): void {
    this.gameSockets.add(socket);
    this.changeStatus();
  }

  removeGameRoomSocket(socket: Socket): void {
    this.gameSockets.delete(socket);
    this.changeStatus();
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

  changeStatus(): void {
    if (this.gameSockets.size !== 0) this.status = 'play';
    else if (this.sockets.size === 0) this.status = 'on';
    else this.status = 'off';
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

  setSocket(
    userId: number,
    socket: Socket,
    type: 'chatLobby' | 'chatRoom' | 'gameLobby' | 'gameRoom',
    rm?: boolean,
  ): void {
    console.log('this.userContainer.at(userId)');
    console.log(this.userContainer.at(userId));
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
    console.log(this.userContainer.at(userId));
  }
}
