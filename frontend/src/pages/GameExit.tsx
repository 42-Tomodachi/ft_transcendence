import React, { useContext, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import { CHAT } from '../utils/interface';

const GameExit: React.FC = () => {
  return (
    <Background>
      <GameRoomContainer>
        <Header type={CHAT} />
        <GameRoomBody>
          <GameArea>
            <Message>WINNER!</Message>
            <Message>WINNER!</Message>
            <Message>CHICKEN</Message>
            <Message>DINNER!</Message>
          </GameArea>
        </GameRoomBody>
      </GameRoomContainer>
    </Background>
  );
};

const Message = styled.p`
  display: flex;
  justify-content: space-around;
  font-style: normal;
  font-family: 'Rubik One';
  color: #ffffff;
  font-weight: 900;
  font-size: 60px;
  line-height: 74px;
  letter-spacing: 0.07em;
  background-color: none;
`;

const Background = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.main};
  overflow-y: auto;
`;
const GameRoomContainer = styled.div`
  width: 1000px;
  margin: 0 auto;
  padding-bottom: 20px;
`;
const GameRoomBody = styled.div`
  display: flex;
  min-height: 700px;
  height: calc(100vh - 160px);
`;
const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 1000px;
  height: 700px;
  background-color: black;
  border-radius: 20px;
`;

export default GameExit;
