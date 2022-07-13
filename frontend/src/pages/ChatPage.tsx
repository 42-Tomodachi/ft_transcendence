import React, { useState, useEffect, useContext } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import UserList from '../components/UserList';
import UserProfile from '../components/UserProfile';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';
import { CHAT, IMessage } from '../utils/interface';
import { useParams } from 'react-router-dom';
import { AllContext } from '../store';
import { chatsAPI } from '../API';
import backaway from '../assets/backaway.png';
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[] | []>([]);
  const { user } = useContext(AllContext).userData;
  const { roomId } = useParams();
  const [roomName, setRoomName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // TODO : 채팅방 참여 인원 불러와서 있으면 그대로, 없으면 루트로 navigate
    if (roomId && user) {
      const getRoomData = async () => {
        const res = await chatsAPI.getChatRoomStatus(+roomId, user.jwt);
        if (res) {
          setRoomName(res.title);
        }
      };
      const getMessages = async (roomId: number, userId: number) => {
        const data = await chatsAPI.getMsgHistoryInChatRoom(roomId, userId, user.jwt);
        setMessages(data);
      };
      getMessages(+roomId, user.userId);
      getRoomData();
    }
  }, [roomId, user]);
  // useEffect(() => {
  //   const jwt = window.localStorage.getItem('jwt');
  //   const roomId = 16; // TODO: get roomId, userId from URL??
  //   const userId = 6;

  //   if (jwt) {
  //     setJwt('SET_JWT', jwt);

  //     const getMessages = async (roomId: number, userId: number) => {
  //       const data1 = await chatsAPI.getMsgHistoryInChatRoom(roomId, userId, jwt);
  //       // const { data } = await axios.get('http://localhost:4000/messages');
  //       // setMessages(data);
  //       console.dir(data1);
  //       setMessages(data1);
  //     };
  //     getMessages(roomId, userId);
  //   }
  // }, []);

  return (
    <Background>
      <ChatRoomContainer>
        <Header type={CHAT} />
        <ChatRoomBody>
          <ChatArea>
            {/* TODO: 뒤로가기 클릭시 짧게나마 제일 첫 페이지가 렌더링됨 */}
            <ChatTitle>
              <BackawayWrap onClick={() => navigate(-1)}>
                <Backaway src={backaway} alt="backaway" />
              </BackawayWrap>
              {roomName}
            </ChatTitle>
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
  display: flex;
  font-size: 20px;
  font-weight: bold;
  margin: 0 10px 20px;
  align-items: center;
`;
const BackawayWrap = styled.div`
  margin-right: 22px;
  /* display: inline-block; */
`;
const Backaway = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  cursor: pointer;
`;

const ChatSideMenu = styled.div``;

export default ChatPage;