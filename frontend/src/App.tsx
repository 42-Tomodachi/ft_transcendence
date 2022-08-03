import React, { useEffect, useContext } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from './utils/styles/mixin';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import './utils/styles/common.css';
import OauthPage from './pages/OauthPage';
import NicknamePage from './pages/NicknamePage';
import SecondAuthPage from './pages/SecondAuthPage';
import ChatPage from './pages/ChatPage';
import UserList from './components/UserList/index';

import ProfilePage from './components/UserProfile';
import { AllContext } from './store';
import ModalTester from './components/common/Modal/ModalTester';
import ModalSet from './components/common/Modal/ModalSet';

import { LOGIN, SET_NICKNAME, LOGOUT } from './utils/interface';
import { usersAPI } from './API';

// 테스트테스트테스트테스트
import GamePage from './pages/GamePage';
import GameStart from './pages/GameStart';
import GameExit from './pages/GameExit';

function App() {
  const { setJwt } = useContext(AllContext).jwtData;
  const { setUserStatus, userStatus } = useContext(AllContext).userStatus;
  const { setUser } = useContext(AllContext).userData;

  useEffect(() => {
    const jwt = window.localStorage.getItem('jwt');
    if (jwt) {
      setJwt('SET_JWT', jwt);
      const getUserData = async () => {
        const res = await usersAPI.getLoginUserProfile(jwt);
        if (res) {
          setUser(LOGIN, { ...res, jwt });
          if (!res.nickname) {
            setUserStatus(SET_NICKNAME);
          } else {
            setUserStatus(LOGIN);
            // console.log('in', userStatus, LOGIN);
          }
        }
      };
      getUserData();
    } else {
      setUserStatus(LOGOUT);
    }
  }, []);

  useEffect(() => {
    console.log(userStatus);
  }, [userStatus]);
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage menu="GAME" />} />
          <Route path="/callback" element={<OauthPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/nickname" element={<NicknamePage />} />
          <Route path="/secondAuth" element={<SecondAuthPage />} />
          <Route path="/profilePage" element={<ProfilePage />} />
          <Route path="/game" element={<MainPage menu="GAME" />} />
          <Route path="/chat" element={<MainPage menu="CHAT" />} />
          <Route path="/chatroom/:roomId" element={<ChatPage />} />
          <Route path="/userlist" element={<UserList />} />

          {/* Tester */}
          <Route path="/modaltester" element={<ModalTester />} />
          {/* ====== */}

          {/* Tester */}
          <Route path="/gameroom" element={<GamePage />} />
          <Route path="/gameroom/1" element={<GameStart />} />
          <Route path="/gameroom/1/gameexit/" element={<GameExit />} />
          {/* ====== */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ModalSet />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
