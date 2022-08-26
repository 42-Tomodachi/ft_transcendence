import React, { useContext, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import { GAME, UPDATE_USER, PLAY } from '../utils/interface';
import { AllContext } from '../store';
import defaultProfile from '../assets/default-image.png';
import ProfileImage from '../components/common/ProfileImage';
import { io, Socket } from 'socket.io-client'; // 아이오 연결하고.
import GameStart from './GameStart';
import { useNavigate } from 'react-router-dom';

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

// interface UserProfileDto {
//   userId: number;
//   nickname: string;
//   avatar: string | null;
//   email: string;
//   winCount: number;
//   loseCount: number;
//   ladderWinCount: number;
//   ladderLoseCount: number;
//   ladderLevel: number;
// }

/*
 * 모달 페이지로 큐에 게임매칭을 수행하게 되면, 이 페이지로 이동합니다.
 * 매칭이 이루어졌다면, 서버에서 매칭유저에 대한 정보를 보내주기로 합의되어있다.
 */
const GamePage: React.FC = () => {
  console.log('re-render?\n');
  let socket: Socket;
  const navigate = useNavigate();
  const [gameStart, setGameStart] = useState(false);
  const { user, setUser } = useContext(AllContext).userData;
  // const { setUserStatus } = useContext(AllContext).userStatus;
  const { playingGameInfo, setPlayingGameInfo } = useContext(AllContext).playingGameInfo;
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

  //console.log(user); // null
  //console.log('게임:' + gameStart); // false

  useEffect(() => {
    const win: HTMLElement | null = document.getElementById('win');
    const win2: HTMLElement | null = document.getElementById('win2');
    const roomid: number = playingGameInfo.gameRoomId;

    if (user && playingGameInfo) {
      //이제 무조건 소켓을 연결할겁니다. 커넥션타입을 어떻게 분기해줄것인지.. 생각해봅시다.
      //gameMode가 아니고, 모달에서 ladder인걸 기록해놓는 무언가 필요한것입니다아...
      socket = io(`${process.env.REACT_APP_BACK_API}`, {
        transports: ['websocket'],
        multiplex: false,
        query: {
          userId: user && user.userId,
          connectionType: playingGameInfo.gameLadder ? 'ladderGame' : 'normalGame',
        },
      });

      socket.on('message', () => {
        console.log(` 일반 connected socket : ${socket.id}`);
        console.log(socket.connected);
        if (user) user.socket = socket;
      });

      // 래더든 일반이든 지금 데이터가 필요하다는걸 서버한테 알려주고,
      // matchData 이벤트로 보내주길..하염없이 기다리는 코드.
      socket.emit('onMatchingScreen', roomid);

      // gameMode가 아니라 래더인지 아닌지를 알려주는 변수여야함!!
      if (playingGameInfo.gameLadder === true) {
        socket.on('matchData', (p1: any, p2: any) => {
          setInfo(info => {
            return {
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
            };
          });

          // 여기부터끝까지가 래더랑 일반이 구조가 중복되니까. 이 리팩이 무사히 돌아가면 함수로 빼겠다는 계획. 1111
          if (win)
            win.style.width = `${
              (p1.ladderWinCount / (p1.ladderWinCount + p1.ladderLoseCount)) * 100
            }%`;
          if (win2)
            win2.style.width = `${
              (p2.ladderWinCount / (p2.ladderWinCount + p2.ladderLoseCount)) * 100
            }%`;
          if (user?.nickname === p1.nickname)
            setPlayingGameInfo({
              ...playingGameInfo,
              player: 'p1',
              oneNickname: p1.nickname,
              twoNickname: p2.nickname,
            });
          else if (user?.nickname === p2.nickname)
            setPlayingGameInfo({
              ...playingGameInfo,
              player: 'p2',
              oneNickname: p1.nickname,
              twoNickname: p2.nickname,
            });
        });
      } else {
        // 래더가 아닐때의 소켓온
        socket.on('matchData', (p1: any, p2: any) => {
          setInfo(info => {
            return {
              nicknameOne: p1.nickname,
              avatarOne: p1.avatar,
              winCountOne: p1.winCount,
              loseCountOne: p1.loseCount,
              ladderLevelOne: p1.ladderLevel,
              nicknameTwo: p2 ? p2.nickname : info.nicknameTwo,
              avatarTwo: p2 ? p2.avatar : info.avatarTwo,
              winCountTwo: p2 ? p2.winCount : info.winCountTwo,
              loseCountTwo: p2 ? p2.loseCount : info.loseCountTwo,
              ladderLevelTwo: p2 ? p2.ladderLevel : info.ladderLevelTwo,
            };
          });
          // 전적표시 바를 승률에 맞게 커스텀 하는 부분
          // 여기부터끝까지가 래더랑 일반이 구조가 중복되니까. 이 리팩이 무사히 돌아가면 함수로 빼겠다는 계획. 2222
          if (win) win.style.width = `${(p1.winCount / (p1.winCount + p1.loseCount)) * 100}%`;
          if (win2 && p2)
            win2.style.width = `${(p2.winCount / (p2.winCount + p2.loseCount)) * 100}%`;

          // 플레이어가 p1이거나 p2이거나, g1임 (관전자)
          if (user?.nickname === p1.nickname)
            setPlayingGameInfo({
              ...playingGameInfo,
              player: 'p1',
              oneNickname: p1.nickname,
              twoNickname: p2?.nickname,
            });
          else if (user?.nickname === p2?.nickname)
            setPlayingGameInfo({
              ...playingGameInfo,
              player: 'p2',
              oneNickname: p1.nickname,
              twoNickname: p2?.nickname,
            });
          else {
            setPlayingGameInfo({
              ...playingGameInfo,
              player: 'g1',
              oneNickname: p1.nickname,
              twoNickname: p2?.nickname,
            });
          }
        });
      }
      socket.on('gameStartCount', (data: number) => {
        console.log('countdown:' + data);
        setCount(data);
        if (data == 0) {
          setGameStart(true);
        }
      });
    } else {
      // setGameStart(true);

      console.log('junselee: user정보가 없어지니까 날라가서 여기로 오는데');
      console.log('junselee: 그냥 홈페이지 /game으로 보내버리는 상황');
      if (socket) {
        console.log('머야 소켓이있었어?');
        socket.disconnect();
      }
      navigate('/game');
    }
    return () => {
      console.log('일로오긴해?: ' + roomid); // -1
      if (socket) {
        socket.off('gameStartCount');
        socket.off('matchData');
        // socket.disconnect();
      }
    };
  }, [user]);

  // 페이지 이동말고, 특정컴포넌트를 보여주게 하는 방식으로 바꿔야 합니다.
  // 함수형으로 반환하는 느낌으로 ..
  if (gameStart === false)
    return (
      <Background>
        <GameRoomContainer>
          <Header type={GAME} />
          <GameRoomBody>
            <GameArea>
              <InfoArea>
                <UserInfo>
                  <PictureBlock>
                    <ProfileImage
                      src={info.avatarOne ? info.avatarOne : defaultProfile}
                      size={150}
                    />
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
                    <ProfileImage
                      src={info.avatarTwo ? info.avatarTwo : defaultProfile}
                      size={150}
                    />
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
  else return <GameStart />; // RTData에서 넘겨받거나, 여기서 방정보 받은거중에, 모드만, 넘겨주거나 둘중하나임.
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
