import React, { createContext, useState } from 'react';
import {
  LOGIN,
  LOGOUT,
  EDIT,
  ModalType,
  IModalData,
  SECOND_AUTH,
  SET_NICKNAME,
  IUserAuth,
  UserStatusType,
  HandleUserType,
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
    userStatus: LOGOUT,
    setUserStatus: () => null,
  },
  jwtData: {
    jwt: '',
    setJwt: () => null,
  },
});

type stateType = {
  modalData: {
    modal: IModalData;
    setModal: (type: ModalType | null) => void;
  };
  userData: {
    user: IUserAuth | null;
    setUser: (type: HandleUserType, user?: IUserAuth) => void;
  };
  userStatus: {
    userStatus: UserStatusType;
    setUserStatus: (type: UserStatusType) => void;
  };
  jwtData: {
    jwt: string;
    setJwt: (type: 'SET_JWT' | 'REMOVE_JWT', jwt?: string) => void;
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
  const [user, setUser] = useState<IUserAuth | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatusType>(LOGOUT);
  const [jwt, setJwt] = useState<string>('');

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

  const handleUser = (type: HandleUserType, user?: IUserAuth) => {
    switch (type) {
      case LOGIN:
        if (user) {
          setUser(user);
          if (!user.nickname) {
            setUserStatus(SET_NICKNAME);
          } else if (user.isSecondAuthOn) {
            setUserStatus(SECOND_AUTH);
          } else {
            setUserStatus(LOGIN);
          }
        }
        return;
      case EDIT:
        if (user) {
          setUser(user);
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
    setUserStatus(type);
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
  };
  return <AllContext.Provider value={data}>{children}</AllContext.Provider>;
};

export { AllContextApi };
