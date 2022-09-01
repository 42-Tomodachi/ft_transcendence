import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';

class UserStatus {
  constructor(userId: number) {
    this.userId = userId;
    this.status = 'off';
    this.chatLobbySockets = new Set();
    this.chatSockets = new Set();
    this.gameLobbySockets = new Set();
    this.gamePlayingSockets = new Set();
    this.gameWatchingSockets = new Set();
  }
  userId: number;
  status: 'on' | 'off' | 'play';
  chatLobbySockets: Set<Socket>;
  chatSockets: Set<Socket>;
  gameLobbySockets: Set<Socket>;
  gamePlayingSockets: Set<Socket>;
  gameWatchingSockets: Set<Socket>;

  setChatLobbySocket(socket: Socket): void {
    this.chatLobbySockets.add(socket);
  }

  setChatRoomSocket(socket: Socket): void {
    this.chatSockets.add(socket);
  }

  setGameLobbySocket(socket: Socket): void {
    this.gameLobbySockets.add(socket);
  }

  setGameRoomSocket(socket: Socket): void {
    this.gameWatchingSockets.add(socket);
  }

  removeChatLobbySocket(socket: Socket): void {
    this.chatLobbySockets.delete(socket);
  }

  removeChatSocket(socket: Socket): void {
    this.chatSockets.delete(socket);
  }

  removeGameLobbySocket(socket: Socket): void {
    this.gameLobbySockets.delete(socket);
  }

  removeGameRoomSocket(socket: Socket): void {
    this.gameWatchingSockets.delete(socket);
  }

  getSockets(): Socket[] {
    const found: Socket[] = [];

    for (const socket of this.chatLobbySockets.values()) {
      found.push(socket);
    }
    for (const socket of this.chatSockets.values()) {
      found.push(socket);
    }
    for (const socket of this.gameLobbySockets.values()) {
      found.push(socket);
    }
    for (const socket of this.gameWatchingSockets.values()) {
      found.push(socket);
    }
    return found;
  }

  changeStatus(): boolean {
    const lastStatus = this.status;

    if (this.gamePlayingSockets.size !== 0) this.status = 'play';
    else if (
      this.chatLobbySockets.size !== 0 ||
      this.chatSockets.size !== 0 ||
      this.gameLobbySockets.size !== 0
    )
      this.status = 'on';
    else this.status = 'off';

    return this.status !== lastStatus;
  }

  broadcastToLobbies(ev: string, ...args: any[]): void {
    for (const cLobby of this.chatLobbySockets) {
      cLobby.broadcast.emit(ev, ...args);
      cLobby.emit(ev, ...args);
    }
    for (const gLobby of this.gameLobbySockets) {
      gLobby.to('gameLobby').emit(ev, ...args);
      gLobby.emit(ev, ...args);
    }
  }
}

@Injectable()
export class UserStatusContainer {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
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
  async setSocket(
    userId: number,
    socket: Socket,
    callIfStatusChanged?: () => void,
  ): Promise<boolean> {
    if (socket.nsp.name == '/ws-chatLobby')
      this.get(userId).setChatLobbySocket(socket);
    else if (socket.nsp.name == '/ws-chat')
      this.get(userId).setChatRoomSocket(socket);
    else if (socket.handshake.query['connectionType'] == 'gameLobby')
      this.get(userId).setGameLobbySocket(socket);
    else if (
      socket.handshake.query['connectionType'] == 'ladderGame' ||
      socket.handshake.query['connectionType'] == 'normalGame'
    )
      this.get(userId).setGameRoomSocket(socket);
    else console.log('userStatus: setSocket: wrong socket');

    const isStatusChanged = this.get(userId).changeStatus();
    if (isStatusChanged) {
      await this.authService.emitUpdatedUserList(userId);
      callIfStatusChanged;
    }
    return isStatusChanged;
  }

  removeSocket(
    userId: number,
    socket: Socket,
    callIfStatusChanged: () => void,
  ): boolean {
    if (socket.nsp.name == 'ws-chatLobby')
      this.get(userId).removeChatLobbySocket(socket);
    else if (socket.nsp.name == 'ws-chat')
      this.get(userId).removeChatSocket(socket);
    else if (socket.handshake.query['connectionType'] == 'gameLobby')
      this.get(userId).removeGameLobbySocket(socket);
    else if (
      socket.handshake.query['connectionType'] == 'ladderGame' ||
      socket.handshake.query['connectionType'] == 'normalGame'
    )
      this.get(userId).removeGameRoomSocket(socket);
    else console.log('userStatus: setSocket: wrong socket');

    const isStatusChanged = this.get(userId).changeStatus();
    if (isStatusChanged) callIfStatusChanged;
    return isStatusChanged;
  }
}
