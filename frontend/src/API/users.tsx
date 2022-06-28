import { instance } from './index';
import {
  IUserKey,
  IUserProfile,
  IGameRecord,
  IUserWinLoseount,
  IFollowId,
  INickname,
} from '../utils/interface';

const usersPath = (path: string) => {
  return `/users${path}`;
};

const usersAPI = {
  // TODO: upload file
  uploadAvatarImg: async (id: number, body: FormData) => {
    try {
      const url = usersPath(`/${id}/uploadImage`);
      const res = await instance.post(url, body);
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
    }
  },
  getAllUsersIdNickName: async (): Promise<IUserKey[] | []> => {
    try {
      const url = usersPath(``);
      const res = await instance.get(url);
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.log(e.message);
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
      if (e instanceof Error) console.error(e);
      else console.error(e);
      return null;
    }
  },
  makeFriend: async (id: number, body: IFollowId): Promise<string | null> => {
    try {
      const url = usersPath(`/${id}/friends`);
      const res = await instance.post(url, body); // TODO: 201이면 따로 반환되는게 없음
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e);
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
      if (e instanceof Error) console.log(e.message);
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
  updateUserNickname: async (id: number, body: INickname): Promise<string | null> => {
    try {
      const url = usersPath(`/${id}/nickname`);
      const res = await instance.put(url, body);
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
  getUserWinLoseCount: async (id: number): Promise<IUserWinLoseount | null> => {
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
  // TODO: 친구 해제 API
  // deleteFriend: async (id: number, body: IFollowId): Promise<string | null> => {
  //   try {
  //     const url = usersPath(`/${id}/friends`);
  //     const res = await instance.delete(url, body);
  //     return res.data;
  //   } catch (e) {
  //     if (e instanceof Error) console.error(e);
  //     else console.error(e);
  //     return null;
  //   }
  // },
};

export { usersAPI };
