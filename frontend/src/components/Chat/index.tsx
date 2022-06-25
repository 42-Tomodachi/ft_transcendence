import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
import Button from '../common/Button';
import ChatList from '../RoomList';
import { CHAT, MAKE_CHAT_ROOM } from '../../utils/interface';
import { AllContext } from '../../store';

const Chat: React.FC = () => {
  const [chatList, setChatList] = useState([]);
  const { setModal } = useContext(AllContext).modalData;

  useEffect(() => {
    const getChatList = async () => {
      const { data } = await axios('http://localhost:4000/chatList');
      setChatList(data);
    };
    getChatList();
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
        <Button width={160} height={40} color="gradient" text="참여중인 채팅방 보기" />
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
