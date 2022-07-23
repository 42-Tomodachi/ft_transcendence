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
const GamePage: React.FC = () => {
  //const socket = io('http://10.19.226.170:5500/');
  const { user } = useContext(AllContext).userData;

  const navigate = useNavigate();
  const [count, setCount] = useState(5); //오피셜은 10초
  const [check, setCheck] = useState(['p1', 'p2']);
  useEffect(() => {
    console.log('onMatchingScreen? ㅇㅇㅇ gogo ');
    // 게임방 화면으로 넘어왔다고 서버에게 알려줄거고, 서버는 .. matchData를 넘겨줄것임

    const roomid = user?.roomid;
    user?.socket.emit('onMatchingScreen', roomid);

    //유저의 닉네임이 들어올거고 난 이걸 자기닉넴과 비교해서 기억해 둬야지
    user?.socket.on('matchData', (p1: any, p2: any) => {
      // 합의하기로는 첫번째 데이터에 left유저, 즉 p1이고, 두번째 데이터가 p2를 보내면, 내가 알아서 기억하는걸로
      // 그렇게하는것으로.. 되어있다!!! 제발 한번에 돼라 !
      console.log('player111:' + p1.nickname);
      console.log('player222:' + p2.nickname);
      setCheck([p1.nickname, p2.nickname]);
      //난잘못없음 내아이디어는 아니고 !
      // 아무튼 내 유저아이디가 player1인지 2인지를 확인해서 기록해두고, 상대방의 닉네임도 기억해둘것
      // 왜냐면 캔버스에서 그려야하는데, 상대방이름을 알수있는 ...유일한 방법이라 (내가 생각하는)
      if (user) {
        if (user?.nickname === p1.nickname) {
          user.player = 'p1';
          user.oppnickname = p2;
        } else if (user?.nickname === p2.nickname) {
          user.player = 'p2';
          user.oppnickname = p1;
        }
      }
    });
    // 카운트다운이 발생하는 .. 서버에서 10초부터 하나씩 보내줄거고, 카운트가 끝나는순간, GameStart.tsx페이지로 이동하는 순간.
    user?.socket.on('gameStartCount', (data: number) => {
      console.log('countdown:' + data);
      setCount(data);
      if (data == 0) {
        console.log('이제 장면을 전환하자 !!!!! <<<<<<<< ');
        navigate('/gameroom/1');
      }
    });
    // const timer = setInterval(() => {
    //   if (count === 0) {
    //     setCount(10);
    //     navigate('/gameroom/1');
    //   } else setCount(count - 1);
    // }, 1000);
    // return () => clearInterval(timer);
  }, []);

  return (
    <Background>
      <GameRoomContainer>
        <Header type={CHAT} />
        <GameRoomBody>
          <GameArea>
            <InfoArea>
              <UserInfo>{check[0]}</UserInfo>
              <Count>{count}</Count>
              <UserInfo>{check[1]}</UserInfo>
            </InfoArea>
            <Message>게임이 곧 시작됩니다</Message>
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
  font-family: 'Roboto';
  color: #ffd12e;
  //font-weight: 400;
  font-size: 40px;
  line-height: 64px;
  background-color: none;
`;

const InfoArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 40px;
  width: 1000px;
  height: 500px;
`;

const Count = styled.p`
  font-style: normal;
  font-family: 'Roboto';
  color: white;
  display: flex;
  text-align: center;
  justify-content: center;
  //font-weight: 400;
  font-size: 150px;
  width: 150px;
  line-height: 150px;
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
  /* align-items: center; */
  //justify-content: space-around;

  width: 1000px;
  height: 700px;
  //background-color: #f9f2ed;
  background-color: black;
  border-radius: 20px;
  // padding: 20px;
`;

export default GamePage;
