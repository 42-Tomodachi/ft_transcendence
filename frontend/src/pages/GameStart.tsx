import React, { useContext, useEffect, useRef, RefObject, useState } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import { GAME } from '../utils/interface'; // GameMode
import { AllContext } from '../store';
import { Socket } from 'socket.io-client';

// test00 :  console.log(`처음 상태가 뭔디 ${ballState(info)},, ${info.ballVelo_X}`);
// test01 :  console.log(`여기서 턴이 바꼈을거란말이지 : ${getTurn(info)}, ${info.turn}`);
// test02 :  console.log('jusnelee: 여기 들어오는순간. 끝났다는것이지.');
// test03 :  console.log(`매맨 처음 상태가 뭔디: ${ballState(gameInfo)}  ${gameInfo.ballVelo_X}`);
// user.socket.on('gameDestroyed', () => {
//   console.log(`게임이 폭파되었나여.`);
// });

// 코드 가독성을 위해서라도, 고정적인 값들은 상수로 박아놓고 사용중입니다.
const PLAYERONE = 1; // 플레이어정보.
const PLAYERTWO = 2; // 플레이어정보.
const HERTZ = 65; // 초당 장면 드로우 횟수
const PADDLEMOVE = 2; // 한번에 움직이는 거리
const LPADDLEHIT = 8; // 왼쪽패들 충돌지점 (X축)
const RPADDLEHIT = 93; // 오른쪽패들 충돌지점 (X축)
const turnG = [true, false]; // 계산할차례 전환에 대한 더블체크
const ballG = [50, 50]; // Realtime ball position
const paddleG = [40, 40]; // Realtime paddle position
const scoreG = [0, 0]; // Realtime socre
const playing = [true, '']; // 게임상태확인 및 승자기록

// 인터페이스 타입정의
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
  const { playingGameInfo } = useContext(AllContext).playingGameInfo;
  const player = user && playingGameInfo.player;
  const roomid = user && playingGameInfo.gameRoomId;

  // player 1 방향으로 시작되는게 기본이고, 장애물맵 경우, 중앙에 장애물이 위치해서 시작위치가 다름.
  const [gameInfo, setGameInfo] = useState<GameInfo>({
    ballP_X: playingGameInfo.gameMode === 'obstacle' ? 40 : 50,
    ballP_Y: 50,
    ballVelo_X: -1,
    ballVelo_Y: 0,
    leftPaddlePos: 40,
    rightPaddlePos: 40,
    player: player === 'p1' ? 1 : 2,
    turn: 1,
    leftScore: 0,
    rightScore: 0,
    checkPoint: false,
  });

  // 패들 그리기.
  const paddle = function paddle(ctx: CanvasRenderingContext2D): void {
    ctx.font = '32px Roboto';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3AB0FF';
    ctx.fillText(` ${playingGameInfo?.oneNickname} : ${scoreG[0]}`, 250, 50);
    ctx.fillRect(0.05 * 1000, paddleG[0] * 7, 0.015 * 1000, 0.2 * 700);
    ctx.fillStyle = '#F87474';
    ctx.fillText(`${playingGameInfo?.twoNickname} : ${scoreG[1]}`, 750, 50);
    ctx.fillRect(0.945 * 1000, paddleG[1] * 7, 0.015 * 1000, 0.2 * 700);
  };

  // 공그리기
  const ball = function ball(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc((ballG[0] / 100) * 1000, (ballG[1] / 100) * 700, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFB562';
    ctx.fill();
  };

  // 장애물맵일경우 장애물그리기.
  const obstacle = function obstacle(ctx: CanvasRenderingContext2D): void {
    if (playingGameInfo.gameMode === 'obstacle') {
      ctx.fillStyle = '#FFB562';
      ctx.fillRect(450, 300, 100, 100); // x, y, width, height
      ctx.fillRect(700, 500, 100, 100); // x, y, width, height
      ctx.fillRect(200, 100, 100, 100); // x, y, width, height
    }
  };

  // 이전에 그린 장면 리셋
  const clear = function clear(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#f9f2ed';
    ctx.clearRect(0, 0, 1000, 700);
    ctx.fillRect(0, 0, 1000, 700);
    ctx.fillStyle = 'white';
    ctx.fillRect(500, 0, 10, 700); //중앙선
    ctx.fillRect(0, 0, 1000, 10); //위
    ctx.fillRect(0, 690, 1000, 10); //아래
    ctx.fillRect(0, 0, 10, 700); //왼
    ctx.fillRect(990, 0, 10, 700); //오
  };

  const defaultGvalue = () => {
    playing[0] = true;
    paddleG[0] = 40;
    paddleG[1] = 40;
    turnG[0] = true;
    turnG[1] = false;
  };

  const defaultGameinfo = () => {
    return setGameInfo(info => {
      return {
        ...info,
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
      };
    });
  };

  // info.ballP_X + info.ballVelo_X : info.ballP_Y + info.ballVelo_Y 다음수 예측

  const checkObstacle = (info: GameInfo) => {
    if (ballState(info) === 'obstacleHit') {
      if (info.ballP_X >= 20 && info.ballP_X <= 30) return 'obLeft';
      else if (info.ballP_X >= 70 && info.ballP_X <= 80) return 'obRight';
      else if (info.ballP_X >= 45 && info.ballP_X <= 55) return 'obCenter';
    }
    return 'default';
  };

  const obstacleUpDwon = (info: GameInfo) => {
    const obstaclePos = checkObstacle(info);
    if (obstaclePos === 'obCenter' && (info.ballP_Y <= 45 || info.ballP_Y >= 55))
      return info.ballP_Y <= 45 ? 'up' : 'down';
    else if (obstaclePos === 'obLeft' && (info.ballP_Y <= 15 || info.ballP_Y >= 25))
      return info.ballP_Y <= 15 ? 'up' : 'down';
    else if (obstaclePos === 'obRight' && (info.ballP_Y <= 73 || info.ballP_Y >= 83))
      return info.ballP_Y <= 73 ? 'up' : 'down';
    else return 'test';
  };

  // 여기가 방향이 기준이면 짧아서 좋지만, 전부다 커버할수가 없어진다.
  const resObstacle = (info: GameInfo, id: string, title: string) => {
    const upDown = obstacleUpDwon(info);
    if (title === 'obCenter') {
      if (upDown === 'up') return id === 'X' ? info.ballP_X : 41;
      if (upDown === 'down') return id === 'X' ? info.ballP_X : 58;
      if (info.ballVelo_X > 0) return id === 'X' ? 44 : info.ballP_Y;
      else return id === 'X' ? 56 : info.ballP_Y;
    } else if (title === 'obLeft') {
      if (upDown === 'up') return id === 'X' ? info.ballP_X : 11;
      if (upDown === 'down') return id === 'X' ? info.ballP_X : 28;
      if (info.ballVelo_X > 0) return id === 'X' ? 19 : info.ballP_Y;
      else return id === 'X' ? 31 : info.ballP_Y;
    } else {
      if (upDown === 'up') return id === 'X' ? info.ballP_X : 69;
      if (upDown === 'down') return id === 'X' ? info.ballP_X : 87;
      if (info.ballVelo_X > 0) return id === 'X' ? 69 : info.ballP_Y;
      else return id === 'X' ? 81 : info.ballP_Y;
    }
  };

  const obstacleHit = (info: GameInfo) => {
    const x = info.ballP_X + info.ballVelo_X;
    const y = info.ballP_Y + info.ballVelo_Y;
    if (x >= 20 && x <= 30 && y >= 12 && y <= 27) return true;
    if (x >= 45 && x <= 55 && y >= 42 && y <= 57) return true;
    else if (x >= 70 && x <= 80 && y >= 70 && y <= 86) return true;
    else return false;
  };

  const obstacleVal = function obstacleVal(info: GameInfo, value: string): number {
    if (value === 'ballP_X')
      return obstacleUpDwon(info) !== 'test' ? info.ballVelo_X : (info.ballVelo_X *= -1);
    else return obstacleUpDwon(info) !== 'test' ? (info.ballVelo_Y *= -1) : info.ballVelo_Y; //Y는 반사각.
  };

  // 상태와 바꿀 밸로시티값을 확인하고 변경값을 리턴합니다.
  // 패들의 위치에 따라 반사각이 달라지는 부분이 조금 지저분합니다.
  const changeVelo = function changeVelo(info: GameInfo, type: string, value: string): number {
    const relativeIntersectY =
      type == 'leftHit'
        ? info.leftPaddlePos + 10 - info.ballP_Y - 1
        : paddleG[1]
        ? paddleG[1] + 10 - info.ballP_Y - 1
        : info.rightPaddlePos + 10 - info.ballP_Y - 1;
    const normalizedRelativeIntersectionY = relativeIntersectY / 10;
    switch (type) {
      case 'leftgoal':
        return value === 'ballP_X' ? 1.5 : 0;
      case 'rightgoal':
        return value === 'ballP_X' ? -1.5 : 0;
      case 'upHit':
        if (value === 'ballP_X') {
          if (info.ballVelo_X > 0) return 1.5;
          else return -1.5;
        } else return 1.5;
      case 'downHit':
        if (value === 'ballP_X') {
          if (info.ballVelo_X > 0) return 1.5;
          else return -1.5;
        } else return -1.5;
      case 'leftHit':
        return value === 'ballP_X' ? 1.5 : -normalizedRelativeIntersectionY;
      case 'rightHit':
        return value === 'ballP_X' ? -1.5 : -normalizedRelativeIntersectionY;
      case 'obstacleHit':
        return obstacleVal(info, value);
      default:
        return value === 'ballP_X' ? info.ballVelo_X : info.ballVelo_Y;
    }
  };

  // 밸로시티가 바뀌는 조건
  const ballState = (info: GameInfo) => {
    if (info.ballP_X >= 100) return 'leftgoal';
    else if (info.ballP_X <= 0) return 'rightgoal';
    else if (info.ballP_Y <= 2) return 'upHit';
    else if (info.ballP_Y >= 97) return 'downHit';
    else if (
      info.ballP_X >= LPADDLEHIT - 4 &&
      info.ballP_X <= LPADDLEHIT &&
      info.ballP_Y >= info.leftPaddlePos &&
      info.ballP_Y <= info.leftPaddlePos + 21
    )
      return 'leftHit';
    else if (
      info.ballP_X >= RPADDLEHIT &&
      info.ballP_X <= RPADDLEHIT + 4 &&
      info.ballP_Y >= info.rightPaddlePos &&
      info.ballP_Y <= info.rightPaddlePos + 21
    )
      return 'rightHit';
    else if (playingGameInfo.gameMode === 'obstacle' && obstacleHit(info)) return 'obstacleHit';
    else return 'rally';
  };

  // 공의 진행이나 리셋값을 반환합니다.
  const ballAction = (info: GameInfo, id: string) => {
    const ballCheck = ballState(info);
    if (playingGameInfo.gameMode === 'obstacle') {
      if (ballCheck === 'rightgoal' || ballCheck === 'leftgoal') {
        if (id === 'X') return ballCheck === 'rightgoal' ? 40 : 60;
        else return 50;
      }
      switch (checkObstacle(info)) {
        case 'obLeft':
          return resObstacle(info, id, 'obLeft');
        case 'obRight':
          return resObstacle(info, id, 'obRight');
        case 'obCenter':
          return resObstacle(info, id, 'obCenter');
        default:
          return id === 'X' ? info.ballP_X + info.ballVelo_X : info.ballP_Y + info.ballVelo_Y;
      }
    } else if (ballCheck === 'rightgoal' || ballCheck === 'leftgoal') return 50;
    else if (
      ballCheck === 'leftHit' &&
      info.ballP_Y <= info.leftPaddlePos + 19 &&
      info.ballP_Y >= info.leftPaddlePos + 2
    )
      return id === 'X' ? 9 : info.ballP_Y;
    else if (
      ballCheck === 'rightHit' &&
      info.ballP_Y <= info.rightPaddlePos + 19 &&
      info.ballP_Y >= info.rightPaddlePos + 2
    )
      return id === 'X' ? 92 : info.ballP_Y;
    else if (playingGameInfo.gameMode === 'speed')
      return id === 'X' ? info.ballP_X + info.ballVelo_X * 2 : info.ballP_Y + info.ballVelo_Y * 2;
    else return id === 'X' ? info.ballP_X + info.ballVelo_X : info.ballP_Y + info.ballVelo_Y;
  };

  // 어떤 플레이어가 계산할 차례인지를 반환합니다.
  const getTurn = (info: GameInfo) => {
    switch (ballState(info)) {
      case 'leftgoal':
        return PLAYERONE;
      case 'rightgoal':
        return PLAYERTWO;
      default:
        if (info.ballVelo_X > 0) return PLAYERTWO;
        else return PLAYERONE;
    }
  };

  const getVelocity = (info: GameInfo, pos: string) => {
    switch (ballState(info)) {
      case 'leftgoal':
        return changeVelo(info, 'leftgoal', pos);
      case 'rightgoal':
        return changeVelo(info, 'rightgoal', pos);
      case 'leftHit':
        return changeVelo(info, 'leftHit', pos);
      case 'rightHit':
        return changeVelo(info, 'rightHit', pos);
      case 'upHit':
        return changeVelo(info, 'upHit', pos);
      case 'downHit':
        return changeVelo(info, 'downHit', pos);
      case 'obstacleHit':
        return changeVelo(info, 'obstacleHit', pos);
      default:
        return changeVelo(info, 'defualt', pos);
    }
  };

  // 상대의 실점을 기록합니다(계산하는 유저입장에서)
  const getCheckPoint = (info: GameInfo) => {
    switch (ballState(info)) {
      case 'leftgoal':
        if (player === 'p2') return true;
        else return false;
      case 'rightgoal':
        if (player === 'p1') return true;
        else return false;
      default:
        return false;
    }
  };

  // 플레이어의 패들위치를 반환합니다.
  const getPaddlePos = (player: string | null, info: GameInfo, pos: string) => {
    if (pos === 'left') {
      if (player === 'p1') return paddleYpos ? paddleYpos : info.leftPaddlePos;
      else return paddleG[0];
    } else {
      if (player === 'p2') return paddleYpos ? paddleYpos : info.rightPaddlePos;
      else return paddleG[1];
    }
  };

  const calValue = async () => {
    return setGameInfo(info => {
      return {
        ...info,
        ballP_X: ballAction(info, 'X'),
        ballP_Y: ballAction(info, 'Y'),
        leftPaddlePos: getPaddlePos(player, info, 'left'),
        rightPaddlePos: getPaddlePos(player, info, 'right'),
        player: player === 'p1' ? 1 : 2,
        ballVelo_X: getVelocity(info, 'ballP_X'),
        ballVelo_Y: getVelocity(info, 'ballP_Y'),
        turn: getTurn(info),
        checkPoint: getCheckPoint(info),
      };
    });
  };

  const settingPlayerStatus = async (value: boolean[]) => {
    if (player === 'p2') {
      value[0] = false;
      value[1] = true;
    } else if (player === 'p1') {
      value[0] = true;
      value[1] = false;
    }
  };

  const checkTurn = (info: GameInfo) => {
    if ((player === 'p1' && info.turn === 1) || (player === 'p2' && info.turn === 2)) return true;
    else return false;
  };

  const eventCalculate = async (info: GameInfo) => {
    if (player !== 'g1' && user && user.socket && user.socket.connected) {
      if (checkTurn(info) === true) {
        await calValue();
        user.socket.emit('calculatedRTData', {
          ballP_X: info.ballP_X,
          ballP_Y: info.ballP_Y,
          leftPaddlePos: getPaddlePos(player, info, 'left'),
          rightPaddlePos: getPaddlePos(player, info, 'right'),
          ballVelo_X: getVelocity(info, 'ballP_X'),
          ballVelo_Y: getVelocity(info, 'ballP_Y'),
          turn: getTurn(info),
          checkPoint: getCheckPoint(info),
        });
      } else if (checkTurn(info) === false) user.socket.emit('paddleRTData', paddleYpos);
    }
  };

  const settingRealTimeData = async (data: number[]) => {
    setGameInfo(gameInfo => {
      return {
        ...gameInfo,
        ballP_X: data[0],
        ballP_Y: data[1],
        ballVelo_X: data[2],
        ballVelo_Y: data[3],
        leftPaddlePos: paddleG[0],
        rightPaddlePos: paddleG[1],
        turn: data[6],
      };
    });
  };

  const settingResultPage = () => {
    playing[0] = false;
    playing[1] =
      scoreG[0] > scoreG[1]
        ? playingGameInfo.oneNickname.toUpperCase()
        : playingGameInfo.twoNickname.toUpperCase();
    defaultGameinfo();
  };

  const eventGetFinished = () => {
    if (user)
      user.socket.on('gameFinished', () => {
        user.socket.disconnect();
        settingResultPage();
      });
  };

  const eventRealTimeData = async () => {
    if (user && user.socket) {
      eventGetFinished();
      user.socket.on('rtData', async (data: number[]) => {
        ballG[0] = data[0];
        ballG[1] = data[1];
        if (data[4]) paddleG[0] = data[4]; //마우스가 움직일때만 받아야 최신
        if (data[5]) paddleG[1] = data[5]; //마우스가 움직일때만 받아야 최신
        scoreG[0] = data[8]; //left score
        scoreG[1] = data[9]; //right score
        if (data[6] === PLAYERONE) turnG[1] = false;
        if (data[6] === PLAYERTWO) turnG[0] = false;
        if (
          (data[6] === PLAYERTWO && player === 'p2' && turnG[1] === false) ||
          (data[6] === PLAYERONE && player === 'p1' && turnG[0] === false)
        ) {
          await settingRealTimeData(data);
          await settingPlayerStatus(turnG); // 딜레이 줄이려면 쓰긴해야겠다.
        }
      });
    } else console.log('ERROR: user undefined');
    return () => {
      defaultGameinfo();
    };
  };

  let paddleYpos: number;

  document.addEventListener('keydown', keyDownHandler, false);
  function keyDownHandler(e: KeyboardEvent) {
    if (player !== 'g1') {
      if (!paddleYpos) paddleYpos = player === 'p1' ? paddleG[0] : paddleG[1];
      if (e.key === 'ArrowRight') {
        if ((player === 'p2' && paddleYpos > 2) || (player === 'p1' && paddleYpos < 78))
          paddleYpos += player === 'p1' ? PADDLEMOVE : -PADDLEMOVE;
      } else if (e.key === 'ArrowLeft')
        if ((player === 'p1' && paddleYpos > 2) || (player === 'p2' && paddleYpos < 78))
          paddleYpos += player === 'p1' ? -PADDLEMOVE : PADDLEMOVE;
    }
  }

  useEffect(() => {
    /////////////////////////////////////
    if (user) {
      user.socket.on('gameTerminated', data => {
        console.log(`gameTerminated: 게임중에 누군가 튕기거나 나갔을때. 이긴상대를 알려줌.${data}`);
        console.log(`gameTerminated: 얘가발생했다는건 무조건 결과페이지로 승자담아서 이동.${data}`);
        playing[0] = false;
        if (data === 1) playing[1] = playingGameInfo.oneNickname.toUpperCase();
        else playing[1] = playingGameInfo.twoNickname.toUpperCase();
        defaultGameinfo();
        user.socket.disconnect();
      });
    }
    return () => {
      defaultGvalue();
      defaultGameinfo();
      if (user)
        if (user.socket) {
          console.log('socket disconnect:' + user.socket.id);
          user.socket.off('rtData');
          user.socket.disconnect();
        }
    };
  }, [user && user.socket]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d', { alpha: false });
      if (user && user.socket && user.socket.connected) {
        if (ctx) {
          const test = setInterval(() => {
            eventCalculate(gameInfo);
            eventRealTimeData();
            clear(ctx);
            obstacle(ctx);
            ball(ctx);
            paddle(ctx);
          }, 1000 / HERTZ);
          return () => {
            clearInterval(test);
          };
        }
      }
    }
    return () => {
      if (user) {
        user.socket.off('rtData');
        user.socket.disconnect();
      }
    };
  }, [eventCalculate]);
  return (
    <GameRoomBody>
      {playing[0] === true ? (
        <GameArea>
          <canvas ref={canvasRef} id="canvas" width="1000" height="700" />;
        </GameArea>
      ) : (
        <ResultArea>
          <Message>{`🏆${playing[1]}🏆`}</Message>
          <Message>.......</Message>
          <Message>WINNER!</Message>
          <Message>WINNER!</Message>
          <Message>CHICKEN</Message>
          <Message>DINNER!</Message>
        </ResultArea>
      )}
    </GameRoomBody>
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

// GameArea랑 백그라운드 컬러만 다름, 알고있음.
const ResultArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 1000px;
  height: 700px;
  background-color: black;
  border-radius: 20px;
`;

export default React.memo(GameStart); //무의미한 리렌더방지
