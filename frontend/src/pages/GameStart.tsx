import React, { useContext, useEffect, useRef, RefObject, useState } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import { CHAT } from '../utils/interface';
import { AllContext } from '../store';
import { useNavigate } from 'react-router-dom';

const calculateOn = [true, false];
const ballball = [50, 50];
const paddlepaddle = [40, 40];
const point = [0, 0];
const HERTZ = 60;
const PLAYERONE = 1;
const PLAYERTWO = 2;

console.log('fst-rendering');

// 계산에 사용할 변수들 정의(인테페이스)
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
  const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
  const { user } = useContext(AllContext).userData;
  const player = user ? user.player : 'g1';
  const navigate = useNavigate();

  //console.log('re-render');
  // 서버와 통신하기 위한 정보변수들을 useState로 관리
  const [gameInfo, setGameInfo] = useState<GameInfo>({
    ballP_X: 50,
    ballP_Y: 50,
    ballVelo_X: -1,
    ballVelo_Y: 0,
    leftPaddlePos: 40,
    rightPaddlePos: 40,
    player: 1,
    turn: 1,
    leftScore: 0,
    rightScore: 0,
    checkPoint: false,
  });

  // 패들위치를 클라이언트의 마우스 위치에 맞게 그려줍니다.
  // 마우스가 움직이지 않을때는, 가장 마지막에 마우스가 머물던 좌표를 기억해야합니다.
  // 마우스 좌표를 받아오는 변수를 그대로 그리는데에 사용하면, 움직이지 않을때 좌표가 사라지기 때문이죠.(null)
  const paddle = function paddle(ctx: CanvasRenderingContext2D): void {
    ctx.font = '32px Roboto';
    ctx.textAlign = 'center';
    if (player == 'p1') {
      ctx.fillStyle = '#3AB0FF';
      ctx.fillText(` ${user?.nickname} : ${point[0]}`, 250, 50);
      ctx.fillRect(
        0.05 * 1000,
        mouseY ? mouseY * 7 : gameInfo.leftPaddlePos * 7,
        0.015 * 1000,
        0.2 * 750,
      );
      ctx.fillStyle = '#F87474';
      ctx.fillText(`${user?.oppnickname} : ${point[1]}`, 750, 50);
      ctx.fillRect(
        0.945 * 1000,
        paddlepaddle[1] ? paddlepaddle[1] * 7 : gameInfo.rightPaddlePos * 7,
        0.015 * 1000,
        0.2 * 700,
      );
    } else if (player == 'p2') {
      ctx.fillStyle = '#3AB0FF';
      ctx.fillText(` ${user?.oppnickname} : ${point[0]}`, 250, 50);
      ctx.fillRect(
        0.05 * 1000,
        paddlepaddle[0] ? paddlepaddle[0] * 7 : gameInfo.leftPaddlePos * 7,
        0.015 * 1000,
        0.2 * 750,
      );
      ctx.fillStyle = '#F87474';
      ctx.fillText(`${user?.nickname} : ${point[1]}`, 750, 50);
      ctx.fillRect(
        0.945 * 1000,
        mouseY ? mouseY * 7 : gameInfo.rightPaddlePos * 7,
        0.015 * 1000,
        0.2 * 700,
      );
    }
  };

  // 이전에 그린 장면 리셋
  const clear = function clear(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#f9f2ed';
    ctx.clearRect(0, 0, 1000, 700);
    ctx.fillRect(0, 0, 1000, 700);
  };

  // 공그리기 (계산하는자는 useState, 안하는자는 socket.on한 data)
  const ball = function ball(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    if ((player === 'p1' && gameInfo.turn === 1) || (player === 'p2' && gameInfo.turn === 2))
      ctx.arc((gameInfo.ballP_X / 100) * 1000, (gameInfo.ballP_Y / 100) * 700, 10, 0, 2 * Math.PI);
    else ctx.arc((ballball[0] / 100) * 1000, (ballball[1] / 100) * 700, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFB562';
    ctx.fill();
  };

  // 상태와 바꿀 밸로시티값을 확인하고 변경값을 리턴합니다.
  // 패들의 위치에 따라 반사각이 달라지는 부분이 조금 지저분합니다.
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

  // 밸로시티가 바뀌는 조건
  const testReturn = (info: GameInfo) => {
    if (info.ballP_Y <= 2) return 'upHit';
    if (info.ballP_Y >= 97) return 'downHit';
    if (
      info.ballP_X >= 4 &&
      info.ballP_X <= 9 &&
      info.ballP_Y >= gameInfo.leftPaddlePos &&
      info.ballP_Y <= gameInfo.leftPaddlePos + 20
    )
      return 'leftHit';
    if (
      info.ballP_X >= 92 &&
      info.ballP_X <= 96 &&
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

  // 공의 진행이나 리셋값을 반환합니다.
  const ballAction = (pos: number, velo: number) => {
    if (gameInfo.ballP_X > 100) return 50;
    else if (gameInfo.ballP_X < 0) return 50;
    else return pos + velo;
  };

  // 어떤 플레이어가 계산할 차례인지를 반환합니다.
  const getTurn = () => {
    switch (testReturn(gameInfo)) {
      case 'leftgoal':
        return PLAYERONE;
      case 'rightgoal':
        return PLAYERTWO;
      case 'leftHit':
        return PLAYERTWO;
      case 'rightHit':
        return PLAYERONE;
      default:
        return gameInfo.turn;
    }
  };

  // 상태에 맞게 밸로시티x 변경함수 호출
  const getXvelo = () => {
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

  // 상태에 맞게 밸로시티y 변경함수 호출
  const getYvelo = () => {
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

  // 마우스포인터의 Y좌표를 받아옵니다.
  // 패들좌표로 사용하기위해 상수 때려넣어서 변형했습니다.
  // 문제는 마우스좌표가 움직이지 않을때는 null이라 그대로 사용할순없습니다.
  let mouseY: number;
  document.addEventListener('mousemove', mouseMoveHandler, false);
  function mouseMoveHandler(e: MouseEvent) {
    mouseY = e.clientY / 7 - 17;
  }

  // 상대의 실점을 기록합니다(계산하는 유저입장에서)
  const getCheckPoint = () => {
    switch (testReturn(gameInfo)) {
      case 'leftgoal':
        return true;
      case 'rightgoal':
        return true;
      default:
        return false;
    }
  };

  // 플레이어의 패들위치를 반환합니다.
  const getPaddlePos = (player: string, pos: string) => {
    if (pos == 'left') {
      if (player === 'p1') return mouseY ? mouseY : gameInfo.leftPaddlePos;
      else return paddlepaddle[0];
    } else {
      if (player === 'p2') return mouseY ? mouseY : gameInfo.rightPaddlePos;
      else return paddlepaddle[1];
    }
  };

  const calculate = () => {
    // 사용하면 React는 이 내부 함수에서 제공하는 상태 스냅샷이 항상 최신 상태 스냅샷이 되도록 보장하며 모든 예약된 상태 업데이트를 염두에 두고 있다.
    // 이것은 항상 최신 상태 스냅샷에서 작업하도록 하는 더 안전한 방법이다.
    // 따라서 상태 업데이트가 이전 상태에 따라 달라질 때마다 여기에서 이 함수 구문을 사용하는 것이 좋다.
    if (user) {
      if (
        (player === 'p1' && calculateOn[0] === true) ||
        (player === 'p2' && calculateOn[1] === true)
      ) {
        // console.log('계산중 : ' + player + ' turn : ' + gameInfo.turn);
        setGameInfo(gameInfo => {
          return {
            ...gameInfo,
            ballP_X: ballAction(gameInfo.ballP_X, gameInfo.ballVelo_X),
            ballP_Y: ballAction(gameInfo.ballP_Y, gameInfo.ballVelo_Y),
            leftPaddlePos:
              player === 'p1' ? getPaddlePos('p1', 'left') : getPaddlePos('p2', 'left'),
            rightPaddlePos:
              player === 'p1' ? getPaddlePos('p1', 'right') : getPaddlePos('p2', 'right'),
            player: player === 'p1' ? 1 : 2,
            ballVelo_X: getXvelo(),
            ballVelo_Y: getYvelo(),
            turn: getTurn(),
            checkPoint: getCheckPoint(),
          };
        });
        user.socket.emit('calculatedRTData', gameInfo);
      } else user.socket.emit('paddleRTData', mouseY);
    }
  };

  // 유즈이펙트로 소켓의 변화가 감지되면 끊어버립니다. (블로그 참조)
  //https://obstinate-developer.tistory.com/entry/React-socket-io-client-%EC%A0%81%EC%9A%A9-%EB%B0%A9%EB%B2%95
  useEffect(() => {
    getData();
    return () => {
      if (user)
        if (user.socket) {
          // console.log('socket disconnect:' + user.socket.id);
          user.socket.disconnect();
        }
    };
  }, [user && user.socket]);

  // 서버가 보내준 갱신데이터를 받습니다.
  // p1, p2가 모두 받아옵니다(계산하는쪽은 상대방 패들위치, 안하는쪽은 그릴 모든 데이터 필요)
  // 그대로 계산안하는쪽 useState에 초당 60번씩 setting하면 좋겠지만, 렉이 심하게 걸려서 우회했습니다.
  // 그리하야, 자신이 계산할 차례가 되는순간에만 받아온값을 setting하고, 이후 계산을 시작합니다.
  const getData = () => {
    if (user) {
      user.socket.on('rtData', (data: number[]) => {
        ballball[0] = data[0];
        ballball[1] = data[1];
        if (data[4]) paddlepaddle[0] = data[4]; //마우스가 움직일때만 받아야 최신
        if (data[5]) paddlepaddle[1] = data[5]; //마우스가 움직일때만 받아야 최신
        point[0] = data[8]; //left score
        point[1] = data[9]; //right score
        if (data[6] === 1) calculateOn[1] = false; //p1이 계산중이면, p2는 아닌거지.
        if (data[6] === 2) calculateOn[0] = false; //p2가 계산중이면, p1는 아닌거지.
        // 플레이어 turn이 바껴버리는 그순간에 값이 렌더링순서로 인해 넘어오질 않았다. (calculateOn사용이유)
        if (
          (data[6] == 2 && player === 'p2' && calculateOn[1] === false) ||
          (data[6] == 1 && player === 'p1' && calculateOn[0] === false)
        ) {
          //console.log('다음턴부터 계산 : ' + player + ' turn : ' + gameInfo.turn);
          setGameInfo(gameInfo => {
            return {
              ...gameInfo,
              ballP_X: data[0],
              ballP_Y: data[1],
              ballVelo_X: data[2],
              ballVelo_Y: data[3],
              leftPaddlePos: player === 'p2' ? paddlepaddle[0] : mouseY ? mouseY : paddlepaddle[0],
              rightPaddlePos: player === 'p1' ? paddlepaddle[1] : mouseY ? mouseY : paddlepaddle[1],
              player: 2,
              turn: data[6],
            };
          });
          if (player === 'p2') {
            calculateOn[0] = false;
            calculateOn[1] = true;
          } else if (player === 'p1') {
            calculateOn[0] = true;
            calculateOn[1] = false;
          }
        }
        if (data[8] == 10 || data[9] == 10) {
          console.log('10점획득 disconnect:' + user.socket.id);
          if (user) user.socket.disconnect();
          navigate(`/gameroom/1/gameexit/`); //GamePage.tsx
        }
      });
    } else console.log('ERROR: user undefined');
  };

  // 드로잉 컨텍스트를 만들 때 alpha 옵션을 false로 설정합니다.(getContext)
  // 이 정보는 렌더링을 최적화하기 위해 브라우저에서 내부적으로 사용할 수 있습니다.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (user && canvas) {
      if (ctx) {
        const test = setInterval(() => {
          calculate();
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
