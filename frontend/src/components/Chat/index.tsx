import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
import Button from '../common/Button';
import RoomList from '../Game/RoomList';

const Chat: React.FC = () => {
  const [chatList, setChatList] = useState([]);

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
        <Button width={160} height={40} color="gradient" text="참여중인 채팅방 보기" />
      </EnteredRoomBtn>
      <RoomList list={chatList} />
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
    font-size: 14px;
    font-weight: bold;
  }
`;

export default Chat;
