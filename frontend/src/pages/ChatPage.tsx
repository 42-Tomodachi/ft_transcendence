import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    const getMessages = async () => {
      const { data } = await axios.get('http://localhost:4000/messages');
      setMessages(data);
    };
    getMessages();
  }, []);

  const openRoomSetting = () => {
    // navigate('/'); // TODO: settingRoom in modalTester
  };

  const leaveChatRoom = () => {
    // navigate(-1); // history 안에 있는 순서상 뒤로가기
    navigate('/game');
  };

  const goMainPage = () => {
    navigate('/game'); // FIXME: game이 맞는건지?
  };

  return (
    <Background>
      <ChatRoomContainer>
        <Header onClickMenu={goMainPage} />

        <ChatRoomBody>
          <ChatArea>
            {/* TODO: dhyeon -> 유저의 닉네임 */}
            <ChatTitle>dhyeon의 채팅방</ChatTitle>
            <MessageList messages={messages} />
            <MessageInput setMessages={setMessages} messages={messages} />
          </ChatArea>
          <ChatSideMenu>
            <UserList />
            <UserProfile />
            <ChatRoomBtnWrap>
              <Button
                color="white"
                width={140}
                height={50}
                text="방 설정"
                onClick={openRoomSetting}
              />
              <Button
                color="white"
                width={140}
                height={50}
                text="방 나가기"
                onClick={leaveChatRoom}
              />
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
  overflow-y: auto;
`;
const ChatRoomContainer = styled.div`
  width: 1000px;
  margin: 0 auto;
  padding: 20px 0;
`;
const ChatRoomBody = styled.div`
  display: flex;
  min-height: 770px;
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
