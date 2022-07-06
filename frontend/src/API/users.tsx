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
  // 이미지 업로드
  uploadAvatarImg: async (id: number, body: FormData, jwt: string): Promise<IUserAvatar | null> => {
    try {
      const url = usersPath(`/${id}/uploadImage`);
      const res = await instance.post(url, body, {
        headers: { ContentType: 'multipart/form-data', Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
  // 모든 유저의 id, 닉네임, 상태
  getAllUsersIdNickName: async (jwt: string): Promise<IUserKey[] | []> => {
    try {
      const url = usersPath(``);
      const res = await instance.get(url, { headers: { Authorization: `Bearer ${jwt}` } });
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return [];
    }
  },
  // 본인 정보 가져오기
  getLoginUserProfile: async (jwt: string): Promise<any> => {
    // TODO: own 프로필 포멧이 변경됨...
    try {
      const url = usersPath(`/own`);
      const response = await instance.get(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error(e);
      }
      return null;
    }
  },
  // 특정 유저의 프로필 조회
  getUserProfile: async (id: number, jwt: string): Promise<IUserProfile | null> => {
    try {
      const url = usersPath(`/${id}`);
      const res = await instance.get(url, { headers: { Authorization: `Bearer ${jwt}` } });
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
  // 친구 추가
  makeFriend: async (id: number, followId: number, jwt: string): Promise<string | null> => {
    try {
      const url = usersPath(`/${id}/friends`);
      const res = await instance.post(
        url,
        { followId },
        { headers: { Authorization: `Bearer ${jwt}` } },
      );
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
  // 친구 목록 조회
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
  // 전적 조회
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
  // 닉네임 변경
  updateUserNickname: async (id: number, nickname: string, jwt: string): Promise<string | null> => {
    try {
      const url = usersPath(`/${id}/nickname`);
      const res = await instance.put(
        url,
        { nickname },
        { headers: { Authorization: `Bearer ${jwt}` } },
      );
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
  // 유저의 승패 카운트 조회
  getUserWinLoseCount: async (id: number, jwt: string): Promise<IUserWinLoseCount | null> => {
    try {
      const url = usersPath(`/${id}/winLoseCount`);
      const res = await instance.get(url, { headers: { Authorization: `Bearer ${jwt}` } });
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
  // 친구 삭제
  deleteFriend: async (id: number, followId: number, jwt: string): Promise<string | null> => {
    try {
      const url = usersPath(`/${id}/friends`);
      const res = await instance.delete(url, {
        data: followId,
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return null;
    }
  },
};
export { usersAPI };
