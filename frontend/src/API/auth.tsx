import { IUser } from '../utils/interface';
import { instance } from './index';

const authPath = (path: string) => {
  return `/auth${path}`;
};

export const authAPI = {
  isSignedUp: async (body: { code: string }): Promise<IUser | null> => {
    try {
      const url = authPath(`/isSignedUp`);
      const response = await instance.post(url, body);
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      } else {
        console.log(e);
      }
      return null;
    }
  },

  setSecondAuth: async (id: number): Promise<boolean | null> => {
    try {
      const url = authPath(`/enableSecondAuth/${id}`);
      const response = await instance.post(url);
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      } else {
        console.log(e);
      }
      return null;
    }
  },

  checkNickname: async (nickname: string): Promise<boolean | null> => {
    try {
      const url = authPath(`/isDuplicateNickname`);
      const response = await instance.post(url, { nickname });
      return response.data.data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      } else {
        console.log(e);
      }
      return null;
    }
  },
};
