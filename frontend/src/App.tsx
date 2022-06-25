import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from './utils/styles/mixin';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import './utils/styles/common.css';
import OauthPage from './pages/OauthPage';
import NicknamePage from './pages/NicknamePage';
import SecondAuthPage from './pages/SecondAuthPage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import UserList from './components/UserList/index';

import ProfilePage from './components/UserProfile';
import { AllContextApi } from './store';
import ModalTester from './components/common/Modal/ModalTester';

function App() {
  return (
    <AllContextApi>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/callback" element={<OauthPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/nickname" element={<NicknamePage />} />
            <Route path="/secondAuth" element={<SecondAuthPage />} />
            <Route path="/profilePage" element={<ProfilePage />} />
            <Route path="/game" element={<HomePage />} />
            <Route path="/chat" element={<HomePage menu="CHAT" />} />
            <Route path="/chatroom" element={<ChatPage />} />
            <Route path="/userlist" element={<UserList />} />

            {/* Tester */}
            <Route path="/modaltester" element={<ModalTester />} />
            {/* ====== */}
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AllContextApi>
  );
}

export default App;
