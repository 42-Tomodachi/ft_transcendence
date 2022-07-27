import React, { useContext, useEffect, useRef, RefObject, useState } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import { CHAT } from '../utils/interface';
import { AllContext } from '../store';

// const MAX_SPEED = 2;
// const MIN_SPEED = 2;
const HERTZ = 80;
const PLAYERONE = 1;
const PLAYERTWO = 2;

/*
 * 캔버스로 게임이 실시간으로 그려지는 페이지입니다.
 * 캔버스를 사용하기위해 useRef를 이용한 기본셋팅이 되어있습니다.
 * GamePage.tsx에서 게임시작전 대기화면을 확인할수있고, 10초를 카운트 한 후에 여기로 이동됩니다.
 */

interface GameInfo {
  ballP_X: number;
  ballP_Y: number;
  ballVelo_X: number;
  ballVelo_Y: number;
  leftPaddlePos: number;
  rightPaddlePos: number;
  player: number;
  turn: number;
  leftScore: number;
  rightScore: number;
  checkPoint: boolean;
}

const GameStart: React.FC = () => {
  let turn22: any;
  turn22 = 1;

  console.log('re-render');

  const [gameInfo, setGameInfo] = useState<GameInfo>({
    ballP_X: 50,
    ballP_Y: 50,
    ballVelo_X: -1,
    ballVelo_Y: 0,
    leftPaddlePos: 0,
    rightPaddlePos: 0,
    player: 1,
    turn: 1,
    leftScore: 0,
    rightScore: 0,
    checkPoint: false,
  }); // 공의 현재위치 (어떤 클라이언트던지 같음11)
  const { user } = useContext(AllContext).userData;

  const [player, setPlayer] = useState<string>(user ? user.player : 'g1'); // 여기는 내가 전역에 저장해둔.. 변수를 읽어와서 사용해야지.
  const [mousePoint, setMousePoint] = useState<number>();
  const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
  const ballball = [0, 0];

  const paddle = function paddle(ctx: CanvasRenderingContext2D): void {
    ctx.font = '32px Roboto';
    ctx.textAlign = 'center';
    if (player == 'p1') {
      ctx.fillStyle = '#3AB0FF';
      ctx.fillText(` ${user?.nickname} : ${gameInfo.leftScore}`, 250, 50);
      ctx.fillRect(0.05 * 1000, gameInfo.leftPaddlePos * 7, 0.015 * 1000, 0.2 * 750);
      ctx.fillStyle = '#F87474';
      ctx.fillText(`${user?.oppnickname} : ${gameInfo.rightScore}`, 750, 50);
      ctx.fillRect(0.945 * 1000, gameInfo.rightPaddlePos * 7, 0.015 * 1000, 0.2 * 700);
    } else if (player == 'p2') {
      ctx.fillStyle = '#3AB0FF';
      ctx.fillText(` ${user?.oppnickname} : ${gameInfo.rightScore}`, 250, 50);
      ctx.fillRect(0.05 * 1000, gameInfo.leftPaddlePos * 7, 0.015 * 1000, 0.2 * 750);
      ctx.fillStyle = '#F87474';
      ctx.fillText(`${user?.nickname} : ${gameInfo.leftScore}`, 750, 50);
      ctx.fillRect(0.945 * 1000, gameInfo.rightPaddlePos * 7, 0.015 * 1000, 0.2 * 700);
    }
  };

  // 클리어가 필요할까?
  // 지워야할것
  // 패드위치
  // 공

  const clear = function clear(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#f9f2ed';
    ctx.clearRect(0, 0, 1000, 700);
    ctx.fillRect(0, 0, 1000, 700);
  };

  const ball = function ball(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    if (player == 'p1')
      ctx.arc((gameInfo.ballP_X / 100) * 1000, (gameInfo.ballP_Y / 100) * 700, 10, 0, 2 * Math.PI);
    if (player == 'p2')
      ctx.arc((ballball[0] / 100) * 1000, (ballball[1] / 100) * 700, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFB562';
    ctx.fill();
  };

  const changeVelo = function a(type: string, value: string): number {
    if (value == 'ballP_X') {
      switch (type) {
        case 'upHit':
          if (gameInfo.ballVelo_X > 0) return 1;
          else return -1;
        case 'downHit':
          if (gameInfo.ballVelo_X > 0) return 1;
          else return -1;
        case 'leftHit':
          return 1;
        case 'rightHit':
          return -1;
        case 'leftgoal':
          return -1;
        case 'rightgoal':
          return 1;
        default:
          return gameInfo.ballVelo_X;
      }
    } else {
      const relativeIntersectY =
        type == 'leftHit'
          ? gameInfo.leftPaddlePos + 10 - gameInfo.ballP_Y - 1
          : gameInfo.rightPaddlePos + 10 - gameInfo.ballP_Y - 1;
      const normalizedRelativeIntersectionY = relativeIntersectY / 10;
      switch (type) {
        case 'upHit':
          return 1;
        case 'downHit':
          return -1;
        case 'leftHit':
          return -normalizedRelativeIntersectionY;
        case 'rightHit':
          return -normalizedRelativeIntersectionY;
        case 'leftgoal':
          return 0;
        case 'rightgoal':
          return 0;
        default:
          return gameInfo.ballVelo_Y;
      }
    }
  };
  const testReturn = (info: GameInfo) => {
    if (info.ballP_Y <= 0) return 'upHit';
    if (info.ballP_Y >= 100) return 'downHit';
    if (
      mousePoint &&
      player == 'p1' &&
      info.ballP_X >= 2 &&
      info.ballP_X <= 9 &&
      info.ballP_Y >= mousePoint &&
      info.ballP_Y <= mousePoint + 20
    )
      return 'leftHit';
    if (
      player == 'p2' &&
      info.ballP_X >= 93 &&
      info.ballP_X <= 98 &&
      info.ballP_Y >= 40 &&
      info.ballP_Y <= 60
    )
      return 'rightHit';
    if (gameInfo.ballP_X > 100) {
      return 'leftgoal';
    } else if (gameInfo.ballP_X < 0) {
      return 'rightgoal';
    }
  };
  const resetTest = (pos: number, velo: number) => {
    if (gameInfo.ballP_X > 100) return 50;
    else if (gameInfo.ballP_X < 0) return 50;
    return pos + velo;
  };
  const turnTest = () => {
    if (testReturn(gameInfo) == 'leftgoal') {
      turn22 = PLAYERONE;
      return PLAYERONE;
    } else if (testReturn(gameInfo) == 'rightgoal') {
      turn22 = PLAYERTWO;
      return PLAYERTWO;
    } else if (testReturn(gameInfo) == 'leftHit') {
      turn22 = PLAYERTWO;
      return PLAYERTWO;
    } else if (testReturn(gameInfo) == 'rightHit') {
      turn22 = PLAYERONE;
      return PLAYERONE;
    } else return gameInfo.turn;
  };
  const XveloTest = () => {
    switch (testReturn(gameInfo)) {
      case 'upHit':
        return changeVelo('upHit', 'ballP_X');
      case 'downHit':
        return changeVelo('downHit', 'ballP_X');
      case 'leftHit':
        return changeVelo('leftHit', 'ballP_X');
      case 'rightHit':
        return changeVelo('rightHit', 'ballP_X');
      case 'leftgoal':
        return changeVelo('leftgoal', 'ballP_X');
      case 'rightgoal':
        return changeVelo('rightgoal', 'ballP_X');
      default:
        return changeVelo('defualt', 'ballP_X');
    }
  };
  const YveloTest = () => {
    switch (testReturn(gameInfo)) {
      case 'upHit':
        return changeVelo('upHit', 'ballP_Y');
      case 'downHit':
        return changeVelo('downHit', 'ballP_Y');
      case 'leftHit':
        return changeVelo('leftHit', 'ballP_Y');
      case 'rightHit':
        return changeVelo('rightHit', 'ballP_Y');
      case 'leftgoal':
        return changeVelo('leftgoal', 'ballP_Y');
      case 'rightgoal':
        return changeVelo('rightgoal', 'ballP_Y');
      default:
        return changeVelo('defualt', 'ballP_Y');
    }
  };

  const cal_basic = () => {
    // setGameInfo({
    //   ...gameInfo,
    //   ballP_X: resetTest(gameInfo.ballP_X, gameInfo.ballVelo_X),
    //   ballP_Y: resetTest(gameInfo.ballP_Y, gameInfo.ballVelo_Y),
    //   leftPaddlePos: mousePoint ? mousePoint : 40,
    //   //leftPaddlePos: player == 'p1' ? mousePoint : gameInfo.leftPaddlePos,
    //   // rightPaddlePos: 20,
    //   player: player == 'p1' ? 1 : 2,
    //   ballVelo_X: XveloTest(),
    //   ballVelo_Y: YveloTest(),
    //   turn: turnTest(),
    // });

    // 사용하면 React는 이 내부 함수에서 제공하는 상태 스냅샷이 항상 최신 상태 스냅샷이 되도록 보장하며 모든 예약된 상태 업데이트를 염두에 두고 있다.
    // 이것은 항상 최신 상태 스냅샷에서 작업하도록 하는 더 안전한 방법이다.
    // 따라서 상태 업데이트가 이전 상태에 따라 달라질 때마다 여기에서 이 함수 구문을 사용하는 것이 좋다.

    setGameInfo(gameInfo => {
      return {
        ...gameInfo,
        ballP_X: resetTest(gameInfo.ballP_X, gameInfo.ballVelo_X),
        ballP_Y: resetTest(gameInfo.ballP_Y, gameInfo.ballVelo_Y),
        leftPaddlePos: mousePoint ? mousePoint : 40,
        player: player == 'p1' ? 1 : 2,
        ballVelo_X: XveloTest(),
        ballVelo_Y: YveloTest(),
        turn: turnTest(),
      };
    });
    if (user) user.socket.emit('calculatedRTData', gameInfo);
  };

  // console.log(' 받는p:' + player + ' turn22: ' + turn22 + ' turn: ' + gameInfo.turn);
  // console.log('pos_x:' + data[0]);
  // console.log('pos_y:' + data[1]);
  // console.log('velo_x:' + data[2]);
  // console.log('velo_y:' + data[3]);
  // console.log('left_p:' + data[4]);
  // console.log('right_p:' + data[5]);
  // console.log('turn:' + data[6]);
  // console.log('point:' + data[7]);
  // useEffect(() => {
  //   if (user) {
  //     setPlayer(user.player);
  //     if (player == 'p2') {
  //       user.socket.on('rtData', (data: any) => {
  //         setGameInfo({ ...gameInfo, ballP_X: data[0], ballP_Y: data[1] });
  //         turn22 = data[6];
  //       });
  //     }
  //   }
  // }, [gameInfo]); // 반영

  // 유즈이펙트로 소켓의 변화가 감지되면 끊어버린다. (블로그 참조)
  //https://obstinate-developer.tistory.com/entry/React-socket-io-client-%EC%A0%81%EC%9A%A9-%EB%B0%A9%EB%B2%95
  useEffect(() => {
    return () => {
      if (user)
        if (user.socket) {
          console.log('디스커넥트? :' + user.socket.id);
          user.socket.disconnect();
        }
    };
  }, [user?.socket]);

  // console.log('pos_x:' + data[0]);
  // console.log('pos_y:' + data[1]);
  // console.log('velo_x:' + data[2]);
  // console.log('velo_y:' + data[3]);
  // console.log('left_p:' + data[4]);
  // console.log('right_p:' + data[5]);
  // console.log('turn:' + data[6]);
  // console.log('point:' + data[7]);
  //console.log(' 계산p:' + player + ' turn22: ' + turn22 + ' turn: ' + gameInfo.turn);

  // const mouseUpdate = () => {
  // const canvas = canvasRef.current;
  // if (canvas)
  //   canvas.onmousemove = e => {
  //     setMousePoint(e.clientY / 7 - 17);
  //   };
  //   return mousePoint;
  // };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    // if (canvas)
    if (user && canvas) {
      if (ctx) {
        const test = setInterval(() => {
          canvas.onmousemove = e => {
            setMousePoint(e.clientY / 7 - 17);
          };
          clear(ctx);
          paddle(ctx);
          ball(ctx);
          if (player == 'p1') cal_basic();
          else {
            user.socket.on('rtData', (data: any) => {
              // rtData(data);
              // setGameInfo({
              //   ...gameInfo,
              //   ballP_X: data[0],
              //   ballP_Y: data[1],
              //   leftPaddlePos: data[4],
              // });
              ballball[0] = data[0];
              ballball[1] = data[1];
              // setGameInfo(gameInfo => {
              //   return {
              //     ...gameInfo,
              //     ballP_X: data[0],
              //     ballP_Y: data[1],
              //     leftPaddlePos: data[4],
              //   };
              // });
              user.socket.emit('paddleRTData', mousePoint);
            });
          }
          // console.log(gameInfo);
        }, (1 / HERTZ) * 1000);
        return () => {
          clearInterval(test);
        };
      }
    }
  }, [gameInfo.ballP_X]); // 반영

  return (
    <Background>
      <GameRoomContainer>
        <Header type={CHAT} />
        <GameRoomBody>
          <GameArea>
            <canvas ref={canvasRef} id="canvas" width="1000" height="700" />;
          </GameArea>
        </GameRoomBody>
      </GameRoomContainer>
    </Background>
  );
};

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
  width: 1000px;
  height: 700px;
  background-color: none;
  border-radius: 20px;
  overflow: hidden;
  // 자식이 부모태그를 넘어가지 않도록 하면, 부모가 보더를 가지고 있을때 자식도 같은 효과를 보니까.
`;

export default GameStart;
