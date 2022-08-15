import { GameMode, IGameRoomInfo, IGameRooms } from '../utils/interface';
import { instance } from './index';

const gamePath = (path: string): string => {
  return `/games${path}`;
};

const gameAPI = {
  // GET /games - getGameRooms
  getGameRooms: async (jwt: string): Promise<IGameRooms[] | []> => {
    try {
      const url = gamePath('');
      const res = await instance.get(url, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return [];
    }
  },
  // POST /games - makeGameRoom
  makeGameRoom: async (
    ownerId: number,
    roomTitle: string,
    password: string | null,
    gameMode: GameMode,
    jwt: string,
  ): Promise<IGameRoomInfo | null> => {
    try {
      const url = gamePath(`/${ownerId}`);
      const res = await instance.post(
        url,
        { ownerId, roomTitle, password, gameMode },
        { headers: { Authorization: `Bearer ${jwt}` } },
      );
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
  // GET /games/{gameId}/users - getMatchingUser(socket io로 제작)
  // getMatchingUser: async (gameId: number, jwt: string) => {
  //   try {
  //     const url = gamePath(`/${gameId}/users`);
  //     // const res = await instance.
  //     // return res.data;
  //   } catch (e) {
  //     if (e instanceof Error) console.error(e.message);
  //     else console.error(e);
  //   }
  // },
  // POST /games/{gameId}/users/{userId} - enterGameRoom
  enterGameRoom: async (
    gameId: number,
    userId: number,
    password: string,
    jwt: string,
  ): Promise<number> => {
    try {
      const url = gamePath(`/${gameId}/users/${userId}`);
      const res = await instance.post(
        url,
        { password: password === '' ? null : password }, //지호킴님 수정요청111
        { headers: { Authorization: `Bearer ${jwt}` } },
      );
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return -1;
    }
  },
  // DELETE /games/{gameId}/users/{userId} - leaveGameRoom
  leaveGameRoom: async (gameId: number, userId: number, jwt: string): Promise<void> => {
    try {
      const url = gamePath(`/${gameId}/users/${userId}`);
      await instance.delete(url, { headers: { Authorization: `Bearer ${jwt}` } });
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
    }
  },
};

export { gameAPI };
