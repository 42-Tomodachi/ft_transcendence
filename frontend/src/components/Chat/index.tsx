import React, { useEffect, useState, useContext } from 'react';
import styled from '@emotion/styled';
import Button from '../common/Button';
import ChatList from '../RoomList';
import { CHAT, IChatRooms, IGameRooms, MAKE_CHAT_ROOM } from '../../utils/interface';
import { AllContext } from '../../store';
import { chatsAPI } from '../../API';

const Chat: React.FC = () => {
  const [chatList, setChatList] = useState<IChatRooms[] | IGameRooms[]>([]);
  const { jwt, setJwt } = useContext(AllContext).jwtData;
  const { setModal } = useContext(AllContext).modalData;
  const { user } = useContext(AllContext).userData;

  const onGetJoinedChatRooms = async () => {
    if (user) {
      const res = await chatsAPI.getJoinedChatRooms(user.userId, jwt);
      setChatList(res);
    } else console.error('not get user');
  };

  useEffect(() => {
    const jwtLocal = localStorage.getItem('jwt');
    const getChatList = async (jwt: string) => {
      const data = await chatsAPI.getChatRoom(jwt);
      setChatList(data);
    };
    if (jwtLocal) {
      setJwt('SET_JWT', jwtLocal);
      getChatList(jwtLocal);
    }
  }, []);

  return (
    <>
      <EnteredRoomBtn>
        <Button
          width={120}
          height={40}
          color="white"
          text="방 만들기"
          onClick={() => setModal(MAKE_CHAT_ROOM)}
        />
        <Button
          width={160}
          height={40}
          color="gradient"
          text="참여중인 채팅방 보기"
          onClick={onGetJoinedChatRooms}
        />
      </EnteredRoomBtn>
      <ChatList list={chatList} type={CHAT} />
    </>
  );
};

const EnteredRoomBtn = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 10px;
  button {
    margin: 0;
    font-size: 16px;
    /* font-weight: 500; */
    &:last-of-type {
      margin-left: 10px;
    }
  }
`;

export default Chat;
