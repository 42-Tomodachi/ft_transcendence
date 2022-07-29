import React, { useContext, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import { CHAT } from '../utils/interface';
import { AllContext } from '../store';
import { useNavigate } from 'react-router-dom';

/*
 * 모달 페이지로 큐에 게임매칭을 수행하게 되면, 이 페이지로 이동합니다.
 * 매칭이 이루어졌다면, 서버에서 매칭유저에 대한 정보를 보내주기로 합의되어있다.
 */
const GameExit: React.FC = () => {
  //const socket = io('http://10.19.226.170:5500/');
  const { user } = useContext(AllContext).userData;

  const navigate = useNavigate();
  const [count, setCount] = useState(5); //오피셜은 10초
  const [check, setCheck] = useState(['p1', 'p2']);

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

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 260px;
  height: 360px;
  //background-color: #f9f2ed;
  background-color: white;
  border-radius: 20px;
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
  //background-color: #f9f2ed;
  background-color: black;
  border-radius: 20px;
  // padding: 20px;
`;

export default GameExit;
