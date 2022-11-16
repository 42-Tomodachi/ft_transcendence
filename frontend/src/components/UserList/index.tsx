import React, { useState, useEffect, useContext } from 'react';
import styled from '@emotion/styled';
import Button from '../common/Button';
import UserItem from './UserItem';
import { OFF, ActiveMenuType, IGetUser, UserRole } from '../../utils/interface';
import { AllContext } from '../../store';
import { chatsAPI, usersAPI } from '../../API';
import { Socket } from 'socket.io-client';

interface UserListType {
  menuType: ActiveMenuType;
  roomId?: string;
  isDm?: boolean;
  socket?: Socket;
}

const UserList: React.FC<UserListType> = ({ menuType, roomId, isDm, socket }) => {
  const { user } = useContext(AllContext).userData;
  const [activeMenu, setActiveMenu] = useState<ActiveMenuType>(menuType);
  const [userList, setUserList] = useState<IGetUser[] | []>([]);
  const [loginUserRole, setLoginUserRole] = useState<UserRole>('guest');

  const selectActiveMenu = async (menuType: ActiveMenuType): Promise<IGetUser[]> => {
    if (user) {
      switch (menuType) {
        case 'ALL':
          return await usersAPI.getAllUsersIdNickName(user.jwt);
        case 'FRIEND':
          return await usersAPI.getFriendList(user.userId, user.jwt);
        case 'INCHAT':
          return await chatsAPI.getUsersInChatRoom(+(roomId as string), user.jwt);
      }
    } // TODO : error handle
    return [];
  };

  const sortedUserList = (data: IGetUser[]) => {
    data.sort((a: IGetUser, b: IGetUser) => {
      return a.nickname > b.nickname ? -1 : 1;
    });
    data.sort((a: IGetUser, b: IGetUser) => {
      b;
      return a.status !== OFF ? -1 : 1;
    });
    data.find(element => {
      if (user && element.userId === user.userId) {
        setLoginUserRole(element.role as UserRole);
      }
    });
    setUserList(data);
  };

  const getUserList = async () => {
    const data = await selectActiveMenu(activeMenu);
    sortedUserList(data);
  };

  useEffect(() => {
    if (socket) {
      if (activeMenu === 'ALL') {
        socket.on('updateUserList', (data: IGetUser[]) => {
          sortedUserList(data);
        });
      } else if (activeMenu === 'FRIEND') {
        socket.on('updateFriendList', (data: IGetUser[]) => {
          sortedUserList(data);
        });
      } else if (activeMenu === 'INCHAT') {
        socket.on('updateChatRoomParticipants', (data: IGetUser[]) => {
          sortedUserList(data);
        });
        socket.on('updateRole', (data: UserRole) => {
          setLoginUserRole(data);
        });
      }
    }
    return () => {
      if (socket) {
        socket.off('updateUserList');
        socket.off('updateFriendList');
        socket.off('updateChatRoomParticipants');
        socket.off('updateRole');
      }
    };
  }, [socket, activeMenu]);

  useEffect(() => {
    if (user && user.jwt) getUserList();
  }, [activeMenu, user, roomId]);

  return (
    <>
      {user && (
        <ListBox>
          <ButtonBox>
            {menuType === 'INCHAT' ? (
              <>
                <Button
                  color={activeMenu === 'INCHAT' ? 'gradient' : 'white'}
                  text="채팅방유저"
                  width={120}
                  height={40}
                  onClick={() => {
                    setActiveMenu('INCHAT');
                  }}
                />
              </>
            ) : (
              <>
                <Button
                  color={activeMenu === 'ALL' ? 'gradient' : 'white'}
                  text="전체유저"
                  width={120}
                  height={40}
                  onClick={() => {
                    setActiveMenu('ALL');
                  }}
                />
              </>
            )}
            <Button
              color={activeMenu === 'FRIEND' ? 'gradient' : 'white'}
              text="친구"
              width={120}
              height={40}
              onClick={() => {
                setActiveMenu('FRIEND');
              }}
            />
          </ButtonBox>
          <UserContainer>
            <ul>
              {activeMenu !== 'ALL'
                ? userList.map(
                    (targetUser: IGetUser, index: number) =>
                      user.userId !== targetUser.userId && (
                        <UserItem
                          key={index}
                          loginUserRole={loginUserRole}
                          targetUser={targetUser}
                          menuType={activeMenu}
                          roomId={roomId}
                          isDm={isDm}
                        />
                      ),
                  )
                : userList.map(
                    (targetUser: IGetUser, index: number) =>
                      user.userId !== targetUser.userId && (
                        <UserItem key={index} targetUser={targetUser} menuType={activeMenu} />
                      ),
                  )}
            </ul>
          </UserContainer>
        </ListBox>
      )}
    </>
  );
};

/*
 ** 탭메뉴(전체유저, 친구)의 부모태그입니다.
 ** 전체유저 태그에 오른쪽마진으로 피그마와 비슷한 간격을 만들어주고, 두버튼의 폰트사이즈를 지정합니다.
 **
 */
const ButtonBox = styled.div`
  & :first-of-type {
    margin-right: 15px;
  }
  & button {
    font-size: 16px;
  }
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserContainer = styled.div`
  ::-webkit-scrollbar {
    display: none;
  }
  :hover {
    ::-webkit-scrollbar {
      display: block;
      width: 4px;
      background-color: ${props => props.theme.colors.grey};
    }
    ::-webkit-scrollbar-thumb {
      background-color: ${props => props.theme.colors.main};
      border-radius: 10px;
    }
  }

  margin-top: 12px;
  overflow-y: scroll;
  height: calc(100% - 52px);
  width: 270px;
`;

const ListBox = styled.div`
  background-color: white;
  border: 2px solid ${props => props.theme.colors.main};
  border-radius: 20px;
  min-width: 300px;
  width: 300px;
  height: calc(100vh - 520px);
  min-height: 340px;
  padding: 17px 23px;
  margin-bottom: 20px;
`;

export default UserList;
