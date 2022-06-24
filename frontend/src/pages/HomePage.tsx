import React, { useState } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import UserList from '../components/UserList';
import UserProfile from '../components/UserProfile';
import Game from '../components/Game';
import { GAME, MenuType } from '../utils/interface';
import Chat from '../components/Chat';
import ModalSet from '../components/common/Modal/ModalSet';

const GamePage: React.FC = () => {
  const [menu, setMenu] = useState<MenuType>(GAME);

  const onClickMenu = (menuType: MenuType) => {
    setMenu(menuType);
  };

  return (
    <Background>
      <HomeContainer>
        <Header onClickMenu={onClickMenu} />
        <HomeContents>
          <MainArea>
            {
              {
                GAME: <Game />,
                CHAT: <Chat />,
              }[menu]
            }
          </MainArea>
          <HomeMenus>
            <UserList />
            <UserProfile />
          </HomeMenus>
        </HomeContents>
        <ModalSet />
      </HomeContainer>
    </Background>
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

export default GamePage;
