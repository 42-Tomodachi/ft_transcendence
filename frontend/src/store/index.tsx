import React, { createContext, useState } from 'react';
import {
  LOGIN,
  LOGOUT,
  ModalType,
  SECOND_AUTH,
  SET_NICKNAME,
  IUser,
  UserStatusType,
  HandleUserType,
} from '../utils/interface';

export const AllContext = createContext<stateType>({
  modalData: {
    modal: null,
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
});

type stateType = {
  modalData: {
    modal: ModalType | null;
    setModal: (type: ModalType | null) => void;
  };
  userData: {
    user: IUser | null;
    setUser: (type: HandleUserType, user?: IUser) => void;
  };
  userStatus: {
    userStatus: UserStatusType;
    setUserStatus: (type: UserStatusType) => void;
  };
};

interface AllContextApiProps {
  children: React.ReactNode;
}

const AllContextApi = ({ children }: AllContextApiProps) => {
  const [modal, setModal] = useState<ModalType | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatusType>(LOGOUT);

  const handleModal = (type: ModalType | null) => {
    setModal(type);
  };

  const handleUser = (type: string, user?: IUser) => {
    switch (type) {
      case LOGIN:
        if (user) {
          setUser(user);
          if (!user.nickname) {
            setUserStatus(SET_NICKNAME);
          } else if (user.secondAuth) {
            setUserStatus(SECOND_AUTH);
          } else {
            setUserStatus(LOGIN);
          }
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
  };
  return <AllContext.Provider value={data}>{children}</AllContext.Provider>;
};

export { AllContextApi };
