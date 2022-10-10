import React, { useContext, useEffect, useRef, RefObject, useState } from 'react';
import styled from '@emotion/styled';
import { AllContext } from '../store';
import { useNavigate } from 'react-router-dom';

const PLAYERONE = 1; // 플레이어정보.
const PLAYERTWO = 2; // 플레이어정보.
const HERTZ = 60; // 초당 장면 드로우 횟수
const PADDLEMOVE = 1; // 한번에 움직이는 거리
const LPADDLEHIT = 8; // 왼쪽패들 충돌지점 (X축)
const RPADDLEHIT = 93; // 오른쪽패들 충돌지점 (X축)
const turnG = [true, false]; // 계산할차례 전환에 대한 더블체크
const ballG = [50, 50]; // Realtime ball position
const paddleG = [40, 40]; // Realtime paddle position
const scoreG = [0, 0]; // Realtime socre
const playing = [true, '']; // 게임상태확인 및 승자기록
const paadllezz = [40];

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
  const player = playingGameInfo.player;
  const navigate = useNavigate();
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

  const drawObject = function paddle(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc((ballG[0] / 100) * 1000, (ballG[1] / 100) * 700, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFB562';
    ctx.fill();
    ctx.font = '32px Noto Sans KR';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3AB0FF';
    ctx.fillText(` ${playingGameInfo?.oneNickname} : ${scoreG[0]}`, 250, 50);
    ctx.fillRect(
      0.05 * 1000,
      player === 'p1' ? paadllezz[0] * 7 : paddleG[0] * 7,
      0.015 * 1000,
      0.2 * 700,
    );
    ctx.fillStyle = '#F87474';
    ctx.fillText(`${playingGameInfo?.twoNickname} : ${scoreG[1]}`, 750, 50);
    ctx.fillRect(
      0.945 * 1000,
      player === 'p2' ? paadllezz[0] * 7 : paddleG[1] * 7,
      0.015 * 1000,
      0.2 * 700,
    );
    if (playingGameInfo.gameMode === 'obstacle') {
      ctx.fillStyle = '#FFB562';
      ctx.fillRect(450, 300, 100, 100);
      ctx.fillRect(700, 500, 100, 100);
      ctx.fillRect(200, 100, 100, 100);
    }
  };

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
    paadllezz[0] = 40;
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
        return value === 'ballP_X' ? -1 : 0;
      case 'rightgoal':
        return value === 'ballP_X' ? 1 : 0;
      case 'upHit':
        if (value === 'ballP_X') {
          if (info.ballVelo_X > 0) return 1;
          else return -1;
        } else return 1;
      case 'downHit':
        if (value === 'ballP_X') {
          if (info.ballVelo_X > 0) return 1;
          else return -1;
        } else return -1;
      case 'leftHit':
        return value === 'ballP_X' ? 1 : -normalizedRelativeIntersectionY;
      case 'rightHit':
        return value === 'ballP_X' ? -1 : -normalizedRelativeIntersectionY;
      case 'obstacleHit':
        return obstacleVal(info, value);
      default:
        return value === 'ballP_X' ? info.ballVelo_X : info.ballVelo_Y;
    }
  };

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

  const goalBallState = (info: GameInfo) => {
    switch (ballState(info)) {
      case 'leftgoal':
        return true;
      case 'rightgoal':
        return true;
      case 'leftHit':
        return true;
      case 'rightHit':
        return true;
      default:
        return false;
    }
  };

  const getCheckPoint = (info: GameInfo) => {
    switch (ballState(info)) {
      case 'leftgoal':
        if (player === 'p1') return true;
        else return false;
      case 'rightgoal':
        if (player === 'p2') return true;
        else return false;
      default:
        return false;
    }
  };

  const getPaddlePos = (player: string, info: GameInfo, pos: string) => {
    if (pos === 'left') {
      if (player === 'p1') return paadllezz[0];
      else return paddleG[0];
    } else {
      if (player === 'p2') return paadllezz[0];
      else return paddleG[1];
    }
  };

  const calValue = async () => {
    realPaddle();
    return setGameInfo(info => {
      return {
        ...info,
        ballP_X: ballAction(info, 'X'),
        ballP_Y: ballAction(info, 'Y'),
        leftPaddlePos: getPaddlePos(player, info, 'left'),
        rightPaddlePos: getPaddlePos(player, info, 'right'),
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
    else if ((player === 'p1' && info.turn === 2) || (player === 'p2' && info.turn == 1))
      return false;
  };

  const eventCalculate = async (info: GameInfo) => {
    if (player !== 'g1' && user && user.socket && user.socket.connected) {
      if (checkTurn(info) === true) {
        realPaddle();
        calValue();
        const goal = goalBallState(info);
        user.socket.emit('calculatedRTData', {
          ballP_X: goal === true ? info.ballP_X : ballAction(info, 'X'),
          ballP_Y: goal === true ? info.ballP_Y : ballAction(info, 'Y'),
          leftPaddlePos: getPaddlePos(player, info, 'left'),
          rightPaddlePos: getPaddlePos(player, info, 'right'),
          ballVelo_X: getVelocity(info, 'ballP_X'),
          ballVelo_Y: getVelocity(info, 'ballP_Y'),
          turn: getTurn(info),
          checkPoint: getCheckPoint(info),
          player: player === 'p1' ? 1 : 2,
        });
      } else if (checkTurn(info) === false) {
        realPaddle();
        user.socket.emit('paddleRTData', paadllezz[0]);
      }
    }
  };

  const settingRealTimeData = async (data: number[]) => {
    setGameInfo(gameInfo => {
      return {
        ...gameInfo,
        ballP_X: ballG[0],
        ballP_Y: ballG[1],
        ballVelo_X: data[2],
        ballVelo_Y: data[3],
        leftPaddlePos: data[4],
        rightPaddlePos: data[5],
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
        user.socket.off();
        settingResultPage();
      });
  };

  const eventRealTimeData = async () => {
    if (user && user.socket) {
      eventGetFinished();
      user.socket.on('rtData', async (data: number[]) => {
        if (data[0] !== ballG[0]) ballG[0] = data[0];
        if (data[1] !== ballG[1]) ballG[1] = data[1];
        if (
          (data[6] === PLAYERONE && data[10] === PLAYERONE) ||
          (data[6] === PLAYERTWO && data[10] === PLAYERTWO)
        ) {
          if (data[4]) paddleG[0] = data[4];
          if (data[5]) paddleG[1] = data[5];
        }
        if (scoreG[0] !== data[8]) scoreG[0] = data[8]; //left score
        if (scoreG[1] !== data[9]) scoreG[1] = data[9]; //right score
        if (data[6] === PLAYERONE) turnG[1] = false;
        if (data[6] === PLAYERTWO) turnG[0] = false;
        if (
          (data[6] === PLAYERTWO && player === 'p2' && turnG[1] === false) ||
          (data[6] === PLAYERONE && player === 'p1' && turnG[0] === false)
        ) {
          await settingPlayerStatus(turnG);
          await settingRealTimeData(data);
        }
      });
    } // TODO: error handling(user not found)
  };

  const realPaddle = () => {
    if (rightPressed) {
      if ((player === 'p2' && paadllezz[0] > 2) || (player === 'p1' && paadllezz[0] < 78)) {
        const test = player === 'p1' ? PADDLEMOVE : -PADDLEMOVE;
        paadllezz[0] += test;
      }
    } else if (leftPressed)
      if ((player === 'p1' && paadllezz[0] > 2) || (player === 'p2' && paadllezz[0] < 78)) {
        const test = player === 'p1' ? -PADDLEMOVE : PADDLEMOVE;
        paadllezz[0] += test;
      }
  };

  let rightPressed: boolean;
  let leftPressed: boolean;

  document.addEventListener('keydown', keyDownHandler, false);
  document.addEventListener('keyup', keyUpHandler, false);
  function keyDownHandler(e: KeyboardEvent) {
    if (player !== 'g1') {
      if (e.key == 'ArrowRight') {
        rightPressed = true;
      } else if (e.key == 'ArrowLeft') {
        leftPressed = true;
      }
    }
  }

  function keyUpHandler(e: KeyboardEvent) {
    if (e.key == 'ArrowRight') {
      rightPressed = false;
    } else if (e.key == 'ArrowLeft') {
      leftPressed = false;
    }
  }

  //게임중에 누군가 튕기거나 나갔을때. 이긴상대를 알려줍니다.
  //발생시 무조건 결과페이지로 승자담아서 이동합니다.
  useEffect(() => {
    if (user) {
      user.socket.on('gameTerminated', data => {
        playing[0] = false;
        if (data === 1) playing[1] = playingGameInfo.oneNickname.toUpperCase();
        else playing[1] = playingGameInfo.twoNickname.toUpperCase();
        defaultGameinfo();
        user.socket.off();
      });
    }
    return () => {
      defaultGvalue();
      defaultGameinfo();
      if (user)
        if (user.socket) {
          user.socket.off();
        }
      navigate('/game');
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
            drawObject(ctx);
          }, 1000 / HERTZ);
          return () => {
            clearInterval(test);
          };
        }
      }
    }
    return () => {
      if (user) {
        user.socket.off();
      }
    };
  }, [eventCalculate]);

  useEffect(() => {
    return () => {
      if (user && user.socket && user.socket.connected) {
        user.socket.disconnect();
      }
    };
  }, [user && user.socket]);
  return (
    <GameRoomBody>
      {playing[0] === true ? (
        <GameArea color="none">
          <canvas ref={canvasRef} id="canvas" width="1000" height="700" />;
        </GameArea>
      ) : (
        <GameArea color="black">
          <Message>{`🏆${playing[1]}🏆`}</Message>
          <Message>.......</Message>
          <Message>WINNER!</Message>
          <Message>WINNER!</Message>
          <Message>CHICKEN</Message>
          <Message>DINNER!</Message>
        </GameArea>
      )}
    </GameRoomBody>
  );
};

const Message = styled.p`
  display: flex;
  justify-content: space-around;
  font-style: normal;
  color: #ffffff;
  font-weight: 900;
  font-size: 60px;
  line-height: 74px;
  letter-spacing: 0.07em;
  background-color: none;
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
  background-color: ${props => props.color || 'none'};
  border-radius: 20px;
  overflow: hidden;
  ${props =>
    props.color === 'black' &&
    `
  align-items: center;
  justify-content: center; `};
`;

export default React.memo(GameStart); //무의미한 리렌더방지
