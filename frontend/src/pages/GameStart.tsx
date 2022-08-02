import React, { useContext, useEffect, useRef, RefObject, useState } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import { CHAT } from '../utils/interface';
import { AllContext } from '../store';
import { useNavigate } from 'react-router-dom';

// gameInfo.turn으로 기준을 잡으면, player1이 turn을 2로 바꾸고 emit했음에도, RTDdata 수신에서는 아직1이고,
// turn은 2로 바꼈기때문에, 계산은 멈춤, 그렇다면, turn이 2로 바뀔때까지만 계산을 계속해주면 되지않을까 하는거임.
const calculateOn = [true, false];
const ballball = [50, 50];
const paddlepaddle = [50, 50];
const point = [0, 0];
const HERTZ = 60;
const PLAYERONE = 1;
const PLAYERTWO = 2;

console.log('fst-rendering');

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

let turn22: number;
const GameStart: React.FC = () => {
  const navigate = useNavigate();
  turn22 = 1;
  //console.log('re-render');
  const { user } = useContext(AllContext).userData;
  const player = user ? user.player : 'g1'; // 여기는 내가 전역에 저장해둔.. 변수를 읽어와서 사용해야지.

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
  });

  const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);

  const paddle = function paddle(ctx: CanvasRenderingContext2D): void {
    ctx.font = '32px Roboto';
    ctx.textAlign = 'center';

    // 2p가 계산할때 gameleftPaddle이 정상적으로 반영될리가 없음. 그런데 , paddlepaddle[0]으로 하기엔, .. 아 되나 ?
    // 일단 패들이 리셋될때마다 튀는데, 그거 잡아야댐. (p1 계산에 잡았던것처럼 잡아보자 바로 될진 모르겠다마는)
    // 지금 gameInfo의 패들을 사용하는건 전혀 의미가 없음, 왜냐면, 자기가 계산할 차례가 아니면, 무용지물이니까.

    // 본인이 계산하고 있으면 저게 맞음.
    // 근데 p1이 계산안하고있으면, 자기껀 자기가 그리는게 맞는데..
    if (player == 'p1') {
      ctx.fillStyle = '#3AB0FF';
      ctx.fillText(` ${user?.nickname} : ${point[0]}`, 250, 50);
      ctx.fillRect(
        0.05 * 1000,
        //test ? test * 7 : paddlepaddle[0] * 7,
        paddlepaddle[0] ? paddlepaddle[0] * 7 : gameInfo.leftPaddlePos * 7,
        0.015 * 1000,
        0.2 * 750,
      );
      ctx.fillStyle = '#F87474';
      ctx.fillText(`${user?.oppnickname} : ${point[1]}`, 750, 50);
      ctx.fillRect(
        0.945 * 1000,
        // 너가 일단, 상대쪽에서 턴이 넘어오는 순간에 최신화가 아님 (gameInfo.rightPaddlePos가 이전 계산 넘겨줄때의 마지막값임)
        paddlepaddle[1] ? paddlepaddle[1] * 7 : gameInfo.rightPaddlePos * 7,
        0.015 * 1000,
        0.2 * 700,
      );
    } else if (player == 'p2') {
      ctx.fillStyle = '#3AB0FF';
      ctx.fillText(` ${user?.oppnickname} : ${point[0]}`, 250, 50);
      ctx.fillRect(
        0.05 * 1000,
        // 너도 일단 상대쪽에서 턴이 넘어올때, 최신화가 아님. (gameInfo.leftPaddlePos가 이전 계산 넘겨줄때의 마지막 계산값임 )
        paddlepaddle[0] ? paddlepaddle[0] * 7 : gameInfo.leftPaddlePos * 7,
        0.015 * 1000,
        0.2 * 750,
      );
      ctx.fillStyle = '#F87474';
      ctx.fillText(`${user?.nickname} : ${point[1]}`, 750, 50);
      ctx.fillRect(
        0.945 * 1000,
        paddlepaddle[1] ? paddlepaddle[1] * 7 : gameInfo.rightPaddlePos * 7,
        0.015 * 1000,
        0.2 * 700,
      );
    }
  };

  const clear = function clear(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#f9f2ed';
    ctx.clearRect(0, 0, 1000, 700);
    ctx.fillRect(0, 0, 1000, 700);
  };

  const ball = function ball(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    //if (player == 'p1')
    if ((player === 'p1' && gameInfo.turn === 1) || (player === 'p2' && gameInfo.turn === 2))
      ctx.arc((gameInfo.ballP_X / 100) * 1000, (gameInfo.ballP_Y / 100) * 700, 10, 0, 2 * Math.PI);
    //if (player == 'p2')
    else ctx.arc((ballball[0] / 100) * 1000, (ballball[1] / 100) * 700, 10, 0, 2 * Math.PI);
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
          : paddlepaddle[1]
          ? paddlepaddle[1] + 10 - gameInfo.ballP_Y - 1
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
      info.ballP_X >= 2 &&
      info.ballP_X <= 9 &&
      info.ballP_Y >= gameInfo.leftPaddlePos &&
      info.ballP_Y <= gameInfo.leftPaddlePos + 20
    )
      return 'leftHit';
    if (
      info.ballP_X >= 93 &&
      info.ballP_X <= 98 &&
      info.ballP_Y >= gameInfo.rightPaddlePos &&
      info.ballP_Y <= gameInfo.rightPaddlePos + 20
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

  let test: number;
  //const [test, setTest] = useState<number>(50);
  document.addEventListener('mousemove', mouseMoveHandler, false);
  function mouseMoveHandler(e: any) {
    test = e.clientY / 7 - 17;
  }

  // const mouseUpdate = () => {
  //   const canvas = canvasRef.current;
  //   if (canvas)
  //     canvas.onmousemove = (e: any) => {
  //      return test = e.clientY / 7 - 17;
  //     };
  // };

  const TestCheckPoint = () => {
    switch (testReturn(gameInfo)) {
      case 'leftgoal':
        return true;
      case 'rightgoal':
        return true;
      default:
        return false;
    }
  };

  const TestPaddlePos = (player: string, pos: string) => {
    if (pos == 'left') {
      if (player === 'p1') return test ? test : gameInfo.leftPaddlePos;
      else return paddlepaddle[0];
    } else {
      if (player === 'p1') return paddlepaddle[1];
      else return test ? test : gameInfo.rightPaddlePos;
    }
  };

  const cal_basic = () => {
    // 사용하면 React는 이 내부 함수에서 제공하는 상태 스냅샷이 항상 최신 상태 스냅샷이 되도록 보장하며 모든 예약된 상태 업데이트를 염두에 두고 있다.
    // 이것은 항상 최신 상태 스냅샷에서 작업하도록 하는 더 안전한 방법이다.
    // 따라서 상태 업데이트가 이전 상태에 따라 달라질 때마다 여기에서 이 함수 구문을 사용하는 것이 좋다.
    if (user) {
      if (
        (player == 'p1' && calculateOn[0] === true) ||
        (player == 'p2' && calculateOn[1] === true)
      ) {
        console.log('플레이어 : ' + player + ' turn : ' + gameInfo.turn);
        setGameInfo(gameInfo => {
          return {
            ...gameInfo,
            ballP_X: resetTest(gameInfo.ballP_X, gameInfo.ballVelo_X),
            ballP_Y: resetTest(gameInfo.ballP_Y, gameInfo.ballVelo_Y),
            leftPaddlePos:
              player === 'p1' ? TestPaddlePos('p1', 'left') : TestPaddlePos('p2', 'left'),
            rightPaddlePos:
              player === 'p1' ? TestPaddlePos('p1', 'right') : TestPaddlePos('p2', 'right'),
            player: player == 'p1' ? 1 : 2,
            ballVelo_X: XveloTest(),
            ballVelo_Y: YveloTest(),
            turn: turnTest(),
            checkPoint: TestCheckPoint(),
          };
        });
        user.socket.emit('calculatedRTData', gameInfo);
      } else user.socket.emit('paddleRTData', test);
    }
  };

  // 유즈이펙트로 소켓의 변화가 감지되면 끊어버린다. (블로그 참조)
  //https://obstinate-developer.tistory.com/entry/React-socket-io-client-%EC%A0%81%EC%9A%A9-%EB%B0%A9%EB%B2%95
  useEffect(() => {
    get_data();
    return () => {
      if (user)
        if (user.socket) {
          console.log('게임끝났어? 바로 디스커넥트 해버려. :' + user.socket.id);
          user.socket.disconnect();
        }
    };
  }, [user && user.socket]);

  // 얘가 조건을 어케 분기해야되냐,
  // 지금 수신을 하는건 p1, 2 둘다인데, 계산하는쪽은 얘를 신경쓸필요가 없고, 받는 쪽은 얘를 받아서 그려줘야댐
  // 그 상태변화를 확인할수 있는건 turn이 왔을때고, p1입장에서는 turn이 2면 계산을 종료하고 여기서 받아그리고
  // p2는 계속 받다가 turn이 자기 자신이 되면, useState를 갱신하고, 그값으로 계산을 시작한다.

  const get_data = () => {
    if (user) {
      user.socket.on('rtData', (data: any) => {
        // 계산하는쪽은 자기가 계산한 데이터를 그리기때문에, 사실상 게산안하는쪽만 반드시 필요한데이터이다.
        // 기억할것은, 그대로 그리다가, 자기가 계산할 차례가 되면, setValue로 저장해둬야한다.
        ballball[0] = data[0];
        ballball[1] = data[1];

        //현재 상대패들을 그릴때 여기를 무조건 참조해야하고,
        //그건 계산 주체가 바껴도 마찬가지다.
        if (data[4]) paddlepaddle[0] = data[4];
        //else paddlepaddle[0] = gameInfo.leftPaddlePos;
        if (data[5]) paddlepaddle[1] = data[5];
        //else paddlepaddle[1] = gameInfo.rightPaddlePos;

        // 현재 스코어 역시, 여기를 모두 참조해야만 한다. 8번이 left점수고 9번이 right점수고
        // 계산은 서버가 알아서 해준다. 받아서 넣기만 하자. 턴이 바뀔때도 유효해야한다.
        point[0] = data[8];
        point[1] = data[9];

        if (data[6] === 1) calculateOn[1] = false;
        if (data[6] === 2) calculateOn[0] = false;
        // 서버에서 보내준 마우스포인터(오른쪽 패들)의 값이 0이 된다.
        // turn이 2면, 서버는 p2가 계산했을거라고 생각할거란 말이지
        // 그럼 left 패들을 무시할거고 , rightPaddle을 받아서, right에다 담아보내줄텐데,
        // 그걸 지금 p1이 쏴주고 있고, p1의 라이트패들값은, 0이니까 턴이 바껴있는순간에는 0을 담아서 라이트에 쏴준다.! 가설 .
        // 근데 확인해본결과 최초 렌더시에 그리질 않고 움직여야 그리는게 문제다
        // 결국 얘가 리렌더링을 발생시킨다는건데,

        // 얘가 턴이 바뀔때마다,,
        if (
          (data[6] == 2 && player === 'p2' && calculateOn[1] === false) ||
          (data[6] == 1 && player === 'p1' && calculateOn[0] === false)
        ) {
          if (player === 'p2') {
            calculateOn[0] = false;
            calculateOn[1] = true;
          } else {
            calculateOn[0] = true;
            calculateOn[1] = false;
          }
          setGameInfo(gameInfo => {
            return {
              ...gameInfo,
              ballP_X: data[0],
              ballP_Y: data[1],
              ballVelo_X: data[2],
              ballVelo_Y: data[3],
              leftPaddlePos: paddlepaddle[0],
              rightPaddlePos: paddlepaddle[1],
              player: 2,
              turn: data[6],
            };
          });
        }
        if (data[8] == 10 || data[9] == 10) {
          console.log('결과 나왔어? 바로 디스커넥트 해버려 :' + user.socket.id);
          if (user) user.socket.disconnect();
          navigate(`/gameroom/1/gameexit/`); //GamePage.tsx
        }
      });
    } else console.log('ERROR: user undefined');
  };

  // console.log('받는속도좀보자 : 왜케빠르냐구..');
  // console.log(' 받는p:' + player + ' turn22: ' + turn22 + ' turn: ' + gameInfo.turn);
  // console.log('pos_x:' + data[0]);
  // console.log('pos_y:' + data[1]);
  // console.log('velo_x:' + data[2]);
  // console.log('velo_y:' + data[3]);
  // console.log('left_p:' + data[4]);
  // console.log('right_p:' + data[5]);
  // console.log('turn:' + data[6]);
  // // console.log('point:' + data[7]);
  // console.log('leftScore:' + data[8]);
  // console.log('lightScore: ' + data[9]);

  useEffect(() => {
    const canvas = canvasRef.current;
    //드로잉 컨텍스트를 만들 때 alpha 옵션을 false로 설정합니다.
    //이 정보는 렌더링을 최적화하기 위해 브라우저에서 내부적으로 사용할 수 있습니다.
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (user && canvas) {
      if (ctx) {
        const test = setInterval(() => {
          cal_basic();
          clear(ctx);
          paddle(ctx);
          ball(ctx);
        }, 1000 / HERTZ);
        return () => {
          clearInterval(test);
        };
      }
    }
  }, [ball]); // 반영

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

// 자식이 부모태그를 넘어가지 않도록 하면, 부모가 보더를 가지고 있을때 자식도 같은 효과를 보니까.
const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  width: 1000px;
  height: 700px;
  background-color: none;
  border-radius: 20px;
  overflow: hidden;
`;

export default React.memo(GameStart);
