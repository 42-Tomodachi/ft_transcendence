import React, { useContext, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import { GAME, UPDATE_USER } from '../utils/interface';
import { AllContext } from '../store';
import { useNavigate } from 'react-router-dom';
// import { LinearProgress } from '@mui/material';
import defaultProfile from '../assets/default-image.png';
import ProfileImage from '../components/common/ProfileImage';
import { io, Socket } from 'socket.io-client'; // 아이오 연결하고.

interface GameInfoDto {
  nicknameOne: string;
  avatarOne: string;
  winCountOne: number;
  loseCountOne: number;
  ladderLevelOne: number;
  nicknameTwo: string;
  avatarTwo: string;
  winCountTwo: number;
  loseCountTwo: number;
  ladderLevelTwo: number;
}

let socket: Socket;

/*
 * 모달 페이지로 큐에 게임매칭을 수행하게 되면, 이 페이지로 이동합니다.
 * 매칭이 이루어졌다면, 서버에서 매칭유저에 대한 정보를 보내주기로 합의되어있다.
 */
const GamePage: React.FC = () => {
  //const socket = io('http://10.19.226.170:5500/');
  const { user, setUser } = useContext(AllContext).userData;
  const { playingGameInfo, setPlayingGameInfo } = useContext(AllContext).playingGameInfo;

  const navigate = useNavigate();
  const [count, setCount] = useState(5); //오피셜은 10초
  const [info, setInfo] = useState<GameInfoDto>({
    nicknameOne: '',
    avatarOne: '',
    winCountOne: 0,
    loseCountOne: 0,
    ladderLevelOne: 0,
    nicknameTwo: '',
    avatarTwo: '',
    winCountTwo: 0,
    loseCountTwo: 0,
    ladderLevelTwo: 0,
  });

  // window.addEventListener('beforeunload', event => {
  //   event.preventDefault();
  //   navigate(`/`);
  //   // 문자열 반환
  //   return '';
  // });

  // 고칠거면, 절반을 기준으로 변하게.
  // const one = (num[0] / (num[0] + num[1])) * 100;
  // const two = (num[1] / (num[1] + num[0])) * 100;
  // const test = setInterval(() => {
  // let oneCount = 0;
  // let twoCount = 0;
  //   if (win && oneCount < one) win.style.width = `${(oneCount += 1)}%`;
  //   if (win2 && twoCount < two) win2.style.width = `${(twoCount += 1)}%`;
  //   //else clearInterval(test);
  // }, 25);
  // return () => {};

  useEffect(() => {
    const win: HTMLElement | null = document.getElementById('win');
    const win2: HTMLElement | null = document.getElementById('win2');
    // if (win) win.style.width = `${(num[0] / (num[0] + num[1])) * 100}%`;
    // if (win2) win2.style.width = `${(num[1] / (num[1] + num[0])) * 100}%`;

    if (user) {
      if (user.socket) {
        console.log('onMatchingScreen? ㅇㅇㅇ gogo ');
        const roomid = playingGameInfo?.gameRoomId;
        user.socket.emit('onMatchingScreen', roomid);

        //   return gamerInfoDto;
        //유저의 닉네임이 들어올거고 난 이걸 자기닉넴과 비교해서 기억해 둬야지
        //ladderWinCount, laddeLoseCount로 들어옵니다. 확인하세여
        user.socket.on('matchData', (p1: any, p2: any) => {
          setInfo({
            nicknameOne: p1.nickname,
            avatarOne: p1.avatar,
            winCountOne: p1.ladderWinCount,
            loseCountOne: p1.ladderLoseCount,
            ladderLevelOne: p1.ladderLevel,
            nicknameTwo: p2.nickname,
            avatarTwo: p2.avatar,
            winCountTwo: p2.ladderWinCount,
            loseCountTwo: p2.ladderLoseCount,
            ladderLevelTwo: p2.ladderLevel,
          });
          if (win)
            win.style.width = `${
              (p1.ladderWinCount / (p1.ladderWinCount + p1.ladderLoseCount)) * 100
            }%`;
          if (win2)
            win2.style.width = `${
              (p2.ladderWinCount / (p2.ladderWinCount + p2.ladderLoseCount)) * 100
            }%`;
          if (user.nickname === p1.nickname)
            setPlayingGameInfo({ ...playingGameInfo, player: 'p1', oppNickname: p2.nickname });
          else if (user.nickname === p2.nickname)
            setPlayingGameInfo({ ...playingGameInfo, player: 'p2', oppNickname: p1.nickname });
        });
        // 카운트다운이 발생하는 .. 서버에서 10초부터 하나씩 보내줄거고, 카운트가 끝나는순간, GameStart.tsx페이지로 이동하는 순간.
        user.socket.on('gameStartCount', (data: number) => {
          console.log('countdown:' + data);
          setCount(data);
          if (data == 0) {
            console.log(`장면전환 /gameroom/${roomid}`);
            navigate(`/gameroom/${roomid}/playing`);
          }
        });
      } else {
        socket = io(`${process.env.REACT_APP_BACK_API}`, {
          transports: ['websocket'],
          query: { userId: user.userId },
        });
        setInfo(info => {
          return {
            ...info,
            nicknameOne: user.nickname == 'junselee' ? user.nickname : info.nicknameOne,
            nicknameTwo: user.nickname == 'jihokim' ? user.nickname : info.nicknameTwo,
          };
        });

        setUser(UPDATE_USER, { ...user, socket: socket });
        console.log('매치게임이 아니면 user.socket이 없을테니까 일로 오겟지.');
      }
    }
  }, []);
  // 페이지 이동말고, 특정컴포넌트를 보여주게 하는 방식으로 바꿔야 합니다.
  // 함수형으로 반환하는 느낌으로 ..
  return (
    <Background>
      <GameRoomContainer>
        <Header type={GAME} />
        <GameRoomBody>
          <GameArea>
            <InfoArea>
              <UserInfo>
                <PictureBlock>
                  <ProfileImage src={info.avatarOne ? info.avatarOne : defaultProfile} size={150} />
                </PictureBlock>
                <span>{`${info.nicknameOne}`}</span>
                <span>{`Lv. ${info.ladderLevelOne}`}</span>
                <Bar>
                  <Win id="win">{info.winCountOne}</Win>
                  <Lose id="los">{info.loseCountOne}</Lose>
                </Bar>
              </UserInfo>
              <Count>{count}</Count>
              <UserInfo>
                <PictureBlock>
                  <ProfileImage src={info.avatarTwo ? info.avatarTwo : defaultProfile} size={150} />
                </PictureBlock>
                <span>{`${info.nicknameTwo}`}</span>
                <span>{`Lv. ${info.ladderLevelTwo}`}</span>
                <Bar>
                  <Win id="win2">{info.winCountTwo}</Win>
                  <Lose id="los">{info.loseCountTwo}</Lose>
                </Bar>
              </UserInfo>
            </InfoArea>
            <Message>게임이 곧 시작됩니다</Message>
          </GameArea>
        </GameRoomBody>
      </GameRoomContainer>
    </Background>
  );
};
const PictureBlock = styled.div``;
// css 애니메이션기능으로 추가.
const Bar = styled.div`
  position: relative;
  width: 210px;
  height: 26px;
  background: #ff6363;
  border-radius: 13px;
  /* overflow: hidden; */
`;

const Win = styled.div`
  width: 50%;
  height: 26px;
  background: #87b7ff;
  border-radius: 13px 0px 0px 13px;
  color: white;
  font-size: 14px;
  padding: 5px;
`;

const Lose = styled.div`
  position: absolute;
  top: 5px;
  right: 10px;
  height: 26px;
  color: white;
  font-size: 14px;
`;

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
  flex-direction: column;
  font-size: 30px;
  /* text-align: center; */
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
