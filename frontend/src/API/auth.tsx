import { IUserAuth } from '../utils/interface';
import { instance } from './index';

const authPath = (path: string) => {
  return `/auth${path}`;
};

export const authAPI = {
  // 로그인시
  isSignedUp: async (body: { code: string }): Promise<IUserAuth | null> => {
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

  // 2차 인증 등록시 이메일 등록 + 코드 발송
  setSecondAuth: async (id: number, email: string): Promise<boolean | null> => {
    try {
      const url = authPath(`/second_auth/${id}`);
      const response = await instance.post(url, { email });
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

  // 2차 인증 등록 완료
  enrollSecondAuth: async (id: number): Promise<boolean> => {
    try {
      const url = authPath(`/second_auth_enroll/${id}`);
      await instance.get(url);
      return true;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      } else {
        console.log(e);
      }
      return false;
    }
  },

  // 2차 인증 코드 발송
  sendSecondAuthCode: async (id: number, jwt: string): Promise<boolean | null> => {
    try {
      const url = authPath(`/second_auth/${id}`);
      const response = await instance.get(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
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

  // 2차 인증 해제
  unsetSecondAuth: async (id: number): Promise<boolean> => {
    try {
      const url = authPath(`/second_auth/${id}`);
      await instance.delete(url);
      return true;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      } else {
        console.log(e);
      }
      return false;
    }
  },

  // 2차 인증 코드 체크
  checkSecondAuthCode: async (id: number, code: number, jwt: string): Promise<boolean | null> => {
    try {
      const url = authPath(`/second_auth_verify/${id}?code=${code}`);
      const response = await instance.get(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
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

  // 닉네임 중복 체크
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
