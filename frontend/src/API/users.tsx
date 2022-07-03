import { instance } from './index';
import {
  IUserKey,
  IUserProfile,
  IGameRecord,
  IUserWinLoseCount,
  IUserAvatar,
} from '../utils/interface';

const usersPath = (path: string) => {
  return `/users${path}`;
};

const usersAPI = {
  uploadAvatarImg: async (id: number, body: FormData): Promise<IUserAvatar | null> => {
    try {
      const url = usersPath(`/${id}/uploadImage`);
      const res = await instance.post(url, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
  getAllUsersIdNickName: async (): Promise<IUserKey[] | []> => {
    try {
      const url = usersPath(``);
      const res = await instance.get(url);
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return [];
    }
  },
  getUserProfile: async (id: number): Promise<IUserProfile | null> => {
    try {
      const url = usersPath(`/${id}`);
      const res = await instance.get(url);
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
  makeFriend: async (id: number, followId: number): Promise<string | null> => {
    try {
      const url = usersPath(`/${id}/friends`);
      const res = await instance.post(url, { followId });
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
  getFriendList: async (id: number): Promise<IUserKey[] | []> => {
    try {
      const url = usersPath(`/${id}/friends`);
      const res = await instance.get(url);
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return [];
    }
  },
  getUserGameRecords: async (id: number): Promise<IGameRecord[] | []> => {
    try {
      const url = usersPath(`/${id}/gameRecords`);
      const res = await instance.get(url);
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return [];
    }
  },
  updateUserNickname: async (id: number, nickname: string): Promise<string | null> => {
    try {
      const url = usersPath(`/${id}/nickname`);
      const res = await instance.put(url, { nickname });
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
  getUserWinLoseCount: async (id: number): Promise<IUserWinLoseCount | null> => {
    try {
      const url = usersPath(`/${id}/winLoseCount`);
      const res = await instance.get(url);
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
  deleteFriend: async (id: number, followId: number): Promise<string | null> => {
    try {
      const url = usersPath(`/${id}/friends`);
      const res = await instance.delete(url, { data: followId });
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
};

export { usersAPI };
