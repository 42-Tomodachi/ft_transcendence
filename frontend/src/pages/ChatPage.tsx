import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
import Header from '../components/Header';
import UserList from '../components/UserList';
import UserProfile from '../components/UserProfile';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';
import { CHAT, IMessage } from '../utils/interface';
import { AllContext } from '../store';
import { chatsAPI } from '../API';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[] | []>([]);
  const { jwt, setJwt } = useContext(AllContext).jwtData;
  const { user } = useContext(AllContext).userData;

  useEffect(() => {
    const jwt = window.localStorage.getItem('jwt');
    const roomId = 16; // TODO: get roomId, userId from URL??
    const userId = 6;

    if (jwt) {
      setJwt('SET_JWT', jwt);

      const getMessages = async (roomId: number, userId: number) => {
        const data1 = await chatsAPI.getMsgHistoryInChatRoom(roomId, userId, jwt);
        // const { data } = await axios.get('http://localhost:4000/messages');
        // setMessages(data);
        console.dir(data1);
        setMessages(data1);
      };
      getMessages(roomId, userId);
    }
  }, []);

  return (
    <Background>
      <ChatRoomContainer>
        <Header type={CHAT} />

        <ChatRoomBody>
          <ChatArea>
            {/* TODO: dhyeon -> 유저의 닉네임 */}
            {/* TODO: Figma 참고하여 Left Arrow 넣어 뒤로가기 버튼 추가 */}
            <ChatTitle> 의 채팅방</ChatTitle>
            <MessageList messages={messages} />
            <MessageInput setMessages={setMessages} messages={messages} />
          </ChatArea>
          <ChatSideMenu>
            <UserList />
            <UserProfile />
          </ChatSideMenu>
        </ChatRoomBody>
      </ChatRoomContainer>
    </Background>
  );
};

const Background = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.main};
  overflow-y: auto;
`;
const ChatRoomContainer = styled.div`
  width: 1000px;
  margin: 0 auto;
  padding-bottom: 20px;
`;
const ChatRoomBody = styled.div`
  display: flex;
  min-height: 700px;
  height: calc(100vh - 160px);
`;
const ChatArea = styled.div`
  width: 680px;
  background-color: white;
  border-radius: 20px;
  margin-right: 20px;
  padding: 20px;
`;
const ChatTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin: 0 10px 20px;
`;

const ChatSideMenu = styled.div``;

export default ChatPage;
