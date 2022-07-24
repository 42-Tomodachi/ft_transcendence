import React, { useContext, useEffect, useRef, RefObject, useState } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
//헤더구성은 일단 채팅꺼 빌려쓴다.
import { CHAT } from '../utils/interface';
import { AllContext } from '../store';

const MAX_SPEED = 2;
const MIN_SPEED = 2;
const HERTZ = 1;

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
  myPaddlePos: number;
  otherPaddlePos: number;
  player: number;
  turn: number;
  myScore: number;
  otherScore: number;
  checkPoint: boolean;
}

const GameStart: React.FC = () => {
  const [gameInfo, setGameInfo] = useState<GameInfo>({
    ballP_X: 50,
    ballP_Y: 50,
    ballVelo_X: -1,
    ballVelo_Y: 0,
    myPaddlePos: 40,
    otherPaddlePos: 40,
    player: 1,
    turn: 1,
    myScore: 0,
    otherScore: 0,
    checkPoint: false,
  }); // 공의 현재위치 (어떤 클라이언트던지 같음11)
  const [player, setPlayer] = useState<string>('p1'); // 플레이어가 누군지.(이건사실 클라이언트에서 각자갱신)
  const [mousePoint, setMousePoint] = useState<number>(0);
  const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
  const { user } = useContext(AllContext).userData;

  const paddle = function paddle(ctx: CanvasRenderingContext2D): void {
    ctx.font = '32px Roboto';
    ctx.textAlign = 'center';
    if (player === 'p1') {
      ctx.fillStyle = '#3AB0FF';
      ctx.fillText(` ${user?.nickname} : ${gameInfo.myScore}`, 250, 50);
      ctx.fillRect(0.05 * 1000, gameInfo.myPaddlePos * 7, 0.015 * 1000, 0.2 * 750);
      ctx.fillStyle = '#F87474';
      ctx.fillText(`${user?.oppnickname} : ${gameInfo.otherScore}`, 750, 50);
      ctx.fillRect(0.945 * 1000, gameInfo.otherPaddlePos * 7, 0.015 * 1000, 0.2 * 700);
    } else {
      ctx.fillStyle = '#3AB0FF';
      ctx.fillText(` ${user?.oppnickname} : ${gameInfo.otherScore}`, 250, 50);
      ctx.fillRect(0.05 * 1000, gameInfo.otherPaddlePos * 7, 0.015 * 1000, 0.2 * 750);
      ctx.fillStyle = '#F87474';
      ctx.fillText(`${user?.nickname} : ${gameInfo.myScore}`, 750, 50);
      ctx.fillRect(0.945 * 1000, gameInfo.myPaddlePos * 7, 0.015 * 1000, 0.2 * 700);
    }
  };

  const clear = function clear(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#f9f2ed';
    ctx.clearRect(0, 0, 1000, 700);
    ctx.fillRect(0, 0, 1000, 700);
  };

  const ball = function ball(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc((gameInfo.ballP_X / 100) * 1000, (gameInfo.ballP_Y / 100) * 700, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFB562';
    ctx.fill();
  };

  const reset = function reset(win: string): void {
    setGameInfo({
      ...gameInfo,
      ballP_X: 50,
      ballP_Y: 50,
      ballVelo_X: win == 'right' ? 1 : -1,
      ballVelo_Y: 0,
      turn: win == 'right' ? 1 : 2,
      myScore: win == 'right' ? gameInfo.myScore : gameInfo.myScore + 1, //얜 임시로 확인하려고, 원래는 서버로부터 받을거임.
      otherScore: win == 'right' ? gameInfo.otherScore + 1 : gameInfo.otherScore,
      checkPoint: true,
    });
  };

  const hitPaddle = function hitPaddle(who: string): void {
    if (who == 'p1') {
      const relativeIntersectY = gameInfo.myPaddlePos + 10 - gameInfo.ballP_Y - 1;
      const normalizedRelativeIntersectionY = relativeIntersectY / 10;
      const test =
        (1 - Math.abs(normalizedRelativeIntersectionY)) * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
      setGameInfo({
        ...gameInfo,
        ballP_X: 9,
        ballVelo_X: test,
        ballVelo_Y: -normalizedRelativeIntersectionY,
        checkPoint: false,
        turn: 2,
      }); // 상대방이 계산
    }
    if (who == 'p2') {
      const relativeIntersectY = gameInfo.otherPaddlePos + 10 - gameInfo.ballP_Y - 1;
      const normalizedRelativeIntersectionY = relativeIntersectY / 10;
      const test1 =
        -(1 - Math.abs(normalizedRelativeIntersectionY)) * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
      setGameInfo({
        ...gameInfo,
        ballP_X: 93,
        ballVelo_X: test1,
        ballVelo_Y: -normalizedRelativeIntersectionY,
        checkPoint: false,
        turn: 2,
      }); // 상대방이 계산
    }
  };

  const cal_basic = function cal(): void {
    setGameInfo({
      ...gameInfo,
      ballP_X: gameInfo.ballP_X + gameInfo.ballVelo_X,
      ballP_Y: gameInfo.ballP_Y + gameInfo.ballVelo_Y,
      myPaddlePos: mousePoint,
    });
    // console.log('x엑스좌표?:' + gameInfo.ballP_X);
    // console.log('x와이좌표?:' + gameInfo.ballP_Y);
    // console.log('x마우스값이 왜?:' + mousePoint);
    //newTest();
    //setGameInfo({ ...gameInfo, myPaddlePos: mousePoint });
    console.log('엑스좌표?:' + gameInfo.ballP_X);
    console.log('와이좌표?:' + gameInfo.ballP_Y);
    console.log('마우스값이 왜?:' + mousePoint);
    // setGameInfo({
    //   ...gameInfo,
    //   checkPoint: false,
    // }); // 뭐든 다시계산할땐 득점이 아님, 득점할때 true로 바꾸면 댐
    // if (gameInfo.ballP_Y >= 100)
    //   setGameInfo({
    //     ...gameInfo,
    //     ballVelo_X: 1,
    //     ballVelo_Y: -1,
    //   }); // 임시로 같은방향임 고쳐야댐
    // if (gameInfo.ballP_Y <= 0)
    //   setGameInfo({
    //     ...gameInfo,
    //     ballVelo_X: -1,
    //     ballVelo_Y: 1,
    //   }); // 임시로 같은방향임 고쳐야댐
    if (player === 'p1' && gameInfo.ballP_X >= 100) reset('left');
    if (player === 'p1' && gameInfo.ballP_X <= 0) reset('right');
    if (
      player == 'p1' &&
      gameInfo.ballP_X >= 2 &&
      gameInfo.ballP_X <= 9 &&
      gameInfo.ballP_Y >= mousePoint &&
      gameInfo.ballP_Y <= mousePoint + 20
    )
      hitPaddle(player);
    if (
      player == 'p1' &&
      gameInfo.ballP_X >= 93 &&
      gameInfo.ballP_X <= 98 &&
      gameInfo.ballP_Y >= gameInfo.otherPaddlePos &&
      gameInfo.ballP_Y <= gameInfo.otherPaddlePos + 20
    )
      hitPaddle('p2');
    //{}   setGameInfo({
    //     ...gameInfo,
    //     ballP_X: 93,
    //   });
    //   const relativeIntersectY = gameInfo.myPaddlePos - gameInfo.ballP_Y - 1;
    //   const normalizedRelativeIntersectionY = relativeIntersectY / 10;
    //   const test =
    //     -(1 - Math.abs(normalizedRelativeIntersectionY)) * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
    //   setGameInfo({
    //     ...gameInfo,
    //     ballVelo_X: test,
    //   });
    //   setGameInfo({
    //     ...gameInfo,
    //     checkPoint: false,
    //   });
    //   setGameInfo({
    //     ...gameInfo,
    //     turn: 1,
    //   }); // 상대방이 계산
    // }
    // if (player == 'p1')
    //   setGameInfo({
    //     ...gameInfo,
    //     player: 1,
    //   });
    // // 상대방이 계산
    // else
    //   setGameInfo({
    //     ...gameInfo,
    //     player: 2,
    //   }); // 상대방이 계산
    //user?.socket.emit('calculatedRTData', gameInfo);
  };

  //마우스 컨트롤
  // 이게 실시간으로 연동안되면, useEffect로 반영해볼것. 안되면 물어보자.
  const mouse = document.getElementById('canvas') as HTMLCanvasElement | null;
  mouse?.addEventListener('mousemove', e => {
    const mouse_pos = getMousePos(e);
    //얘가 계산된 마우스 좌표임 근데, 내가 누군지 알아야. 자기꺼에 맞는 위치에 그림
    // 사실 간단한게, 얘를 따로 받아서 최신값으로 갱신해주면됨.
    if (mouse_pos) setMousePoint((mouse_pos.y / mouse.height) * 100);
    else console.log('변수 mouse_pos가 0이 나왔다 : 비정상 ');
  });

  // rect: DOMRect | undefined;
  // 원래 변수가 ret이었고, const로 처리하니까 뭐가 없긴한데, ret으로 자료형을 명시해줄거면 위처럼해주면 될거같다.
  const getMousePos = function getMousePos(evt: MouseEvent) {
    const rect = mouse?.getBoundingClientRect();
    if (rect)
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      };
    else {
      // 움직임이 있을때만 들어오겠지?
      console.log('설마 움직임도 없는데 실행돼서 여기로 오겠어?? : 비정상 <<<< ');
      return 0;
    }
  };

  // 내가 찾아낸 리액트 + ts에서 캔버스2d를 사용할 유일한 방법..
  // 다른방법이 있는진 모르겠으나 난 이 방법밖에 모르겠음.
  useEffect(() => {
    // if (user) {
    //   setPlayer(user.player);
    //   user.socket.on('rtData', (data: any) => {
    //     //data: [number, number] | number | boolean
    //     // console.log('ballx' + data[0]);
    //     // console.log('bally' + data[1]);
    //     // console.log('velox' + data[2]);
    //     // console.log('veloy' + data[3]);
    //     // console.log('lpaddle' + data[4]);
    //     // console.log('rpaddle' + data[5]);
    //     // console.log('turn' + data[6]);
    //     // console.log('checkpoint' + data[7]);

    //     setGameInfo({ ...gameInfo, ballP_X: data[0] });
    //     setGameInfo({ ...gameInfo, ballP_Y: data[1] });
    //     setGameInfo({ ...gameInfo, ballVelo_X: data[2] });
    //     setGameInfo({ ...gameInfo, ballVelo_Y: data[3] });
    //     if (player == 'p1') setGameInfo({ ...gameInfo, otherPaddlePos: data[5] });
    //     if (player == 'p2') setGameInfo({ ...gameInfo, otherPaddlePos: data[4] });
    //     setGameInfo({ ...gameInfo, turn: data[6] });
    //     setGameInfo({ ...gameInfo, checkPoint: data[7] });
    //   });
    // }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      clear(ctx);
      paddle(ctx);
      ball(ctx);
      const test = setInterval(() => {
        //위에가 필요없는게 아니고 아래가 필요없는거였네, 아니 이것도 실제 소켓으로 대전을 하게 되면 렌더가 어케될지 모름
        //일단 혼자돌릴땐 없어도됨, 근데 끊기는 증상은 둘다 넣을때가 제일 적음.. 이것도 생각해볼일.
        clear(ctx);
        paddle(ctx);
        ball(ctx);
        cal_basic();
        // setGameInfo({ ...gameInfo, ballP_X: 74 });
        // console.log('여기선 왜변해! : ' + gameInfo.ballP_X);
        // console.log('아마도??? : ' + gameInfo.ballP_Y);
        // console.log('아마도??? : ' + gameInfo.myPaddlePos);
      }, 60); //1000이면 최초시작도 1초 있다가 시작. (바로 시작하고 1초를 기다리는게 아님.)
      return () => clearInterval(test);
    }
  }, [gameInfo]); // 반영

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
