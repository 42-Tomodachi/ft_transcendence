import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
import Header from '../components/Header';
import UserList from '../components/UserList';
import UserProfile from '../components/UserProfile';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';
import { CHAT, IMessage } from '../utils/interface';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[] | []>([]);

  useEffect(() => {
    const getMessages = async () => {
      const { data } = await axios.get('http://localhost:4000/messages');
      setMessages(data);
    };
    getMessages();
  }, []);

  return (
    <Background>
      <ChatRoomContainer>
        <Header type={CHAT} />

        <ChatRoomBody>
          <ChatArea>
            {/* TODO: dhyeon -> 유저의 닉네임 */}
            {/* TODO: Figma 참고하여 Left Arrow 넣어 뒤로가기 버튼 추가 */}
            <ChatTitle>dhyeon의 채팅방</ChatTitle>
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
