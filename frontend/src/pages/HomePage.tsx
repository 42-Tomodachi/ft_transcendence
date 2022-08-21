import React, { useContext, useEffect } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import UserList from '../components/UserList';
import UserProfile from '../components/UserProfile';
import Game from '../components/Game';
import { HOME, MenuType, UPDATE_RECORD } from '../utils/interface';
import Chat from '../components/Chat';
import { AllContext } from '../store';
import { usersAPI } from '../API';

import { io, Socket } from 'socket.io-client';

interface HomePageProps {
  menu?: MenuType;
}

let socket: Socket;

const HomePage: React.FC<HomePageProps> = ({ menu }) => {
  const { setUser, user } = useContext(AllContext).userData;

  useEffect(() => {
    if (user) {
      const getWinLoseCount = async () => {
        const res = await usersAPI.getUserWinLoseCount(user.userId, user.jwt);
        if (res) {
          setUser(UPDATE_RECORD, undefined, res);
        }
      };
      getWinLoseCount();
    }
    if (menu === 'CHAT') {
      socket = io(`${process.env.REACT_APP_BACK_API}/ws-chatLobby`, {
        transports: ['websocket'],
        multiplex: false,
        query: {
          userId: user && user.userId,
        },
      });
    } else if (menu === 'GAME') {
      console.log('hello Game world!');
      // TODO: Game로비 연결부
      socket = io(`${process.env.REACT_APP_BACK_API}`, {
        transports: ['websocket'],
        multiplex: false,
        query: {
          userId: user && user.userId,
          connectionType: 'gameLobby',
        },
      });
      socket.on('message', () => {
        console.log(` 로비 connected socket : ${socket.id}`);
        console.log(socket.connected); // true
        if (user) user.socket = socket;
      });
    }
  }, [menu]);

  return (
    <>
      <Background>
        <HomeContainer>
          <Header type={HOME} />
          <HomeContents>
            <MainArea>{menu && menu === 'CHAT' ? <Chat /> : <Game />}</MainArea>
            <HomeMenus>
              <UserList menuType={'ALL'} />
              <UserProfile />
            </HomeMenus>
          </HomeContents>
        </HomeContainer>
      </Background>
    </>
  );
};

const Background = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.main};
  overflow-y: auto;
`;
const HomeContainer = styled.div`
  width: 1000px;
  margin: 0 auto;
`;

const HomeContents = styled.div`
  display: flex;
  height: calc(100vh - 160px);
  min-height: 700px;
  margin-bottom: 20px;
`;

const MainArea = styled.div`
  width: 680px;
  background-color: white;
  border-radius: 20px;
  margin-right: 20px;
  padding: 20px 20px;
  overflow: hidden;
`;

const HomeMenus = styled.div`
  width: 300px;
  height: 100%;
`;

export default HomePage;
