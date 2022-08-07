import React, { createContext, useState } from 'react';
import {
  LOGIN,
  LOGOUT,
  UPDATE_USER,
  UPDATE_RECORD,
  ModalType,
  IModalData,
  IUserData,
  SECOND_AUTH,
  SET_NICKNAME,
  UserStatusType,
  HandleUserType,
  IWinLoseCount,
  LOADING,
  IPlayingGameInfo,
} from '../utils/interface';

export const AllContext = createContext<stateType>({
  modalData: {
    modal: {
      modal: null,
      id: -1,
    },
    setModal: () => null,
  },
  userData: {
    user: null,
    setUser: () => null,
  },
  userStatus: {
    userStatus: LOADING,
    setUserStatus: () => null,
  },
  jwtData: {
    jwt: '',
    setJwt: () => null,
  },
  targetItem: {
    targetId: 0,
    setTargetId: () => null,
  },
  playingGameInfo: {
    playingGameInfo: {
      player: '',
      oppNickname: '',
      gameRoomId: -1,
    },
    setPlayingGameInfo: () => null,
  },
});

type stateType = {
  modalData: {
    modal: IModalData;
    setModal: (type: ModalType | null, id?: number) => void;
  };
  userData: {
    user: IUserData | null;
    setUser: (type: HandleUserType, user?: IUserData, record?: IWinLoseCount) => void;
  };
  userStatus: {
    userStatus: UserStatusType;
    setUserStatus: (type: UserStatusType) => void;
  };
  jwtData: {
    jwt: string;
    setJwt: (type: 'SET_JWT' | 'REMOVE_JWT', jwt?: string) => void;
  };
  targetItem: {
    targetId: number;
    setTargetId: (type: number) => void;
  };
  playingGameInfo: {
    playingGameInfo: IPlayingGameInfo;
    setPlayingGameInfo: (type: IPlayingGameInfo | null) => void;
  };
};

interface AllContextApiProps {
  children: React.ReactNode;
}

const AllContextApi = ({ children }: AllContextApiProps) => {
  const [modal, setModal] = useState<IModalData>({
    modal: null,
    id: -1,
  });
  const [user, setUser] = useState<IUserData | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatusType>(LOADING);
  const [jwt, setJwt] = useState<string>('');
  const [targetId, setTargetId] = useState<number>(0);
  const [playingGameInfo, setPlayingGameInfo] = useState<IPlayingGameInfo>({
    player: '',
    oppNickname: '',
    gameRoomId: -1,
  });

  const handleJwt = (type: 'SET_JWT' | 'REMOVE_JWT', jwt?: string) => {
    switch (type) {
      case 'SET_JWT':
        if (jwt) {
          setJwt(jwt);
          window.localStorage.setItem('jwt', jwt);
        }
        return;
      case 'REMOVE_JWT':
        setJwt('');
        window.localStorage.removeItem('jwt');
        return;
      default:
        return;
    }
  };

  const handleModal = (type: ModalType | null, id?: number) => {
    setModal({
      modal: type,
      id: id || -1,
    });
  };

  const handleUser = (type: HandleUserType, data?: IUserData, record?: IWinLoseCount) => {
    switch (type) {
      case LOGIN:
        if (data) {
          setUser(data);
          if (!data.nickname) {
            setUserStatus(SET_NICKNAME);
          } else if (data.isSecondAuthOn) {
            setUserStatus(SECOND_AUTH);
          } else {
            setUserStatus(LOGIN);
          }
        }
        return;
      case UPDATE_USER:
        if (user && data) {
          setUser({ ...data });
        }
        return;
      case UPDATE_RECORD:
        if (user && record) {
          setUser({ ...user, ...record });
        }
        return;

      case LOGOUT:
        setUser(null);
        return;
      default:
        return;
    }
  };

  const handleUserStatus = (type: UserStatusType) => {
    // console.log('store', type);
    setUserStatus(type);
  };

  const handleTargetId = (type: number) => {
    setTargetId(type);
  };

  const handlePlayingGameInfo = (type: IPlayingGameInfo | null) => {
    if (type) {
      setPlayingGameInfo({
        player: type.player,
        oppNickname: type.oppNickname,
        gameRoomId: type.gameRoomId,
      });
    }
  };

  const data = {
    modalData: {
      modal,
      setModal: handleModal,
    },
    userData: {
      user,
      setUser: handleUser,
    },
    userStatus: {
      userStatus,
      setUserStatus: handleUserStatus,
    },
    jwtData: {
      jwt,
      setJwt: handleJwt,
    },
    targetItem: {
      targetId,
      setTargetId: handleTargetId,
    },
    playingGameInfo: {
      playingGameInfo,
      setPlayingGameInfo: handlePlayingGameInfo,
    },
  };
  return <AllContext.Provider value={data}>{children}</AllContext.Provider>;
};

export { AllContextApi };
