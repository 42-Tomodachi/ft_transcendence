import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
import Header from '../components/Header';
import UserList from '../components/UserList';
import UserProfile from '../components/UserProfile';
import Button from '../components/common/Button';
import MessageList from '../components/Chat/MessageList';
import { IMessage } from '../utils/interface';
import MessageInput from '../components/Chat/MessageInput';

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
        <Header />
        <ChatRoomBody>
          <ChatArea>
            <ChatTitle>dhyeon의 채팅방</ChatTitle>
            <MessageList messages={messages} />
            <MessageInput setMessages={setMessages} messages={messages} />
          </ChatArea>
          <ChatSideMenu>
            <UserList />
            <UserProfile />
            <ChatRoomBtnWrap>
              <Button color="white" width={140} height={50} text="방 설정" />
              <Button color="white" width={140} height={50} text="방 나가기" />
            </ChatRoomBtnWrap>
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
  overflow: hidden;
`;
const ChatRoomContainer = styled.div`
  width: 1000px;
  margin: 0 auto;
`;
const ChatRoomBody = styled.div`
  display: flex;
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
const ChatRoomBtnWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  & button {
    &:first-of-type {
      margin-right: 10px;
    }
  }
`;

export default ChatPage;
