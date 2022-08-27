import React, { useContext, useEffect, useRef, RefObject, useState } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import { GAME, CHECK_SCORE } from '../utils/interface'; // GameMode
import { AllContext } from '../store';
// import { useNavigate } from 'react-router-dom'; //네비
// import { useBeforeunload } from 'react-beforeunload';
// import { useHistory } from 'react-router-dom'; // 설치한 패키지

const calculateOn = [true, false]; // useState변수인 turn이 값을바껴도 다음에 값이 바껴서 문제가되는걸로 판단, 추가 및 문제해결.
const ballball = [50, 50]; // 받아온 rtData중에 공의 위치를 실시간으로 그려주자.
const paddlepaddle = [40, 40]; // 플레이어들의 패들을 실시간으로 그려야해서 저장해주자.
const point = [0, 0]; // 플레이어들의 점수를 그려야해서, 실시간으로 저장해주자.
const HERTZ = 60; //
const PLAYERONE = 1;
const PLAYERTWO = 2;
const playing = [true, ''];
// const obstaclePos = [Math.floor(Math.random() * 500)];
// const refreshTest = [false];

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
  // const navigate = useNavigate();
  const { setModal } = useContext(AllContext).modalData;
  const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
  const { user } = useContext(AllContext).userData;
  const { playingGameInfo } = useContext(AllContext).playingGameInfo;
  const player = user && playingGameInfo.player;
  const roomid = user && playingGameInfo.gameRoomId;

  // 서버와 통신하기 위한 정보변수들을 useState로 관리
  const [gameInfo, setGameInfo] = useState<GameInfo>({
    ballP_X: 50,
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

  // 패들위치를 클라이언트의 마우스 위치에 맞게 그려줍니다.
  // 마우스가 움직이지 않을때는, 가장 마지막에 마우스가 머물던 좌표를 기억해야합니다.
  // 마우스 좌표를 받아오는 변수를 그대로 그리는데에 사용하면, 움직이지 않을때 좌표가 사라지기 때문이죠.(null)
  const paddle = function paddle(ctx: CanvasRenderingContext2D): void {
    ctx.font = '32px Roboto';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3AB0FF';
    ctx.fillText(` ${playingGameInfo?.oneNickname} : ${point[0]}`, 250, 50);
    ctx.fillRect(0.05 * 1000, paddlepaddle[0] * 7, 0.015 * 1000, 0.2 * 700);
    ctx.fillStyle = '#F87474';
    ctx.fillText(`${playingGameInfo?.twoNickname} : ${point[1]}`, 750, 50);
    ctx.fillRect(0.945 * 1000, paddlepaddle[1] * 7, 0.015 * 1000, 0.2 * 700);
  };

  // 공그리기 (계산하는자는 useState, 안하는자는 socket.on한 data)
  const ball = function ball(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc((ballball[0] / 100) * 1000, (ballball[1] / 100) * 700, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFB562';
    ctx.fill();
  };

  const obstacle = function obstacle(ctx: CanvasRenderingContext2D): void {
    if (playingGameInfo.gameMode === 'obstacle') {
      ctx.fillStyle = '#FFB562';
      // ctx.fillStyle = 'black';
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

  const defaultGameinfo = () => {
    return setGameInfo(() => {
      return {
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

  const obstacleUpDwon = (info: GameInfo) => {
    if (checkObstacle(info) === 'obCenter' && (info.ballP_Y <= 45 || info.ballP_Y >= 55))
      return info.ballP_Y <= 45 ? 'up' : 'down';
    else if (checkObstacle(info) === 'obLeft' && (info.ballP_Y <= 15 || info.ballP_Y >= 25))
      return info.ballP_Y <= 15 ? 'up' : 'down';
    if (checkObstacle(info) === 'obRight' && (info.ballP_Y <= 73 || info.ballP_Y >= 83))
      return info.ballP_Y <= 73 ? 'up' : 'down';
    else return 'test';
  };

  const obstacleHit = (info: GameInfo) => {
    if (info.ballP_X >= 20 && info.ballP_X <= 30 && info.ballP_Y >= 12 && info.ballP_Y <= 27)
      return true;
    if (info.ballP_X >= 45 && info.ballP_X <= 55 && info.ballP_Y >= 42 && info.ballP_Y <= 57)
      return true;
    else if (info.ballP_X >= 70 && info.ballP_X <= 80 && info.ballP_Y >= 70 && info.ballP_Y <= 86)
      return true;
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
        : paddlepaddle[1]
        ? paddlepaddle[1] + 10 - info.ballP_Y - 1
        : info.rightPaddlePos + 10 - info.ballP_Y - 1;
    const normalizedRelativeIntersectionY = relativeIntersectY / 10;
    //uphit나 downhit판정으로 리턴되어버리면, goal판정에대한 벨로시티가 이상하게 반영됨
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

  // 밸로시티가 바뀌는 조건
  const testReturn = (info: GameInfo) => {
    if (info.ballP_X >= 100) return 'leftgoal';
    else if (info.ballP_X <= 0) return 'rightgoal';
    else if (info.ballP_Y <= 2) return 'upHit';
    else if (info.ballP_Y >= 97) return 'downHit';
    else if (
      info.ballP_X >= 4 &&
      info.ballP_X <= 8 &&
      info.ballP_Y >= info.leftPaddlePos &&
      info.ballP_Y <= info.leftPaddlePos + 21
    )
      return 'leftHit';
    else if (
      info.ballP_X >= 93 &&
      info.ballP_X <= 96 &&
      info.ballP_Y >= info.rightPaddlePos &&
      info.ballP_Y <= info.rightPaddlePos + 21
    )
      return 'rightHit';
    else if (playingGameInfo.gameMode === 'obstacle' && obstacleHit(info)) return 'obstacleHit';
    else return 'rally';
  };

  const checkObstacle = (info: GameInfo) => {
    if (testReturn(info) === 'obstacleHit') {
      if (info.ballP_X >= 20 && info.ballP_X <= 30) return 'obLeft';
      else if (info.ballP_X >= 45 && info.ballP_X <= 55) return 'obCenter';
      else if (info.ballP_X >= 70 && info.ballP_X <= 80) return 'obRight';
    }
    return 'default';
  };

  // console.log(`매맨 처음 상태가 뭔디: ${testReturn(gameInfo)}  ${gameInfo.ballVelo_X}`);

  // 여기가 방향이 기준이면 짧아서 좋지만, 전부다 커버할수가 없어진다.
  const resObstacle = (info: GameInfo, id: string, title: string) => {
    if (title === 'obCenter') {
      if (obstacleUpDwon(info) === 'up') return id === 'X' ? info.ballP_X : 41;
      if (obstacleUpDwon(info) === 'down') return id === 'X' ? info.ballP_X : 58;
      if (info.ballVelo_X > 0) return id === 'X' ? 44 : info.ballP_Y;
      else return id === 'X' ? 56 : info.ballP_Y;
    } else if (title === 'obLeft') {
      if (obstacleUpDwon(info) === 'up') return id === 'X' ? info.ballP_X : 11;
      if (obstacleUpDwon(info) === 'down') return id === 'X' ? info.ballP_X : 28;
      if (info.ballVelo_X > 0) return id === 'X' ? 19 : info.ballP_Y;
      else return id === 'X' ? 31 : info.ballP_Y;
    } else {
      if (obstacleUpDwon(info) === 'up') return id === 'X' ? info.ballP_X : 69;
      if (obstacleUpDwon(info) === 'down') return id === 'X' ? info.ballP_X : 87;
      if (info.ballVelo_X > 0) return id === 'X' ? 69 : info.ballP_Y;
      else return id === 'X' ? 81 : info.ballP_Y;
    }
  };

  // 공의 진행이나 리셋값을 반환합니다.
  const ballAction = (info: GameInfo, id: string) => {
    // console.log(`ㄱㅗㅇ ㅇㅓ디 ${gameInfo.ballP_X}`);
    if (testReturn(info) === 'rightgoal' || testReturn(info) === 'leftgoal') return 50;
    else if (
      testReturn(info) === 'leftHit' &&
      info.ballP_Y <= info.leftPaddlePos + 19 &&
      info.ballP_Y >= info.leftPaddlePos + 2
    )
      return id === 'X' ? 9 : info.ballP_Y;
    else if (
      testReturn(info) === 'rightHit' &&
      info.ballP_Y <= info.rightPaddlePos + 19 &&
      info.ballP_Y >= info.rightPaddlePos + 2
    )
      return id === 'X' ? 92 : info.ballP_Y;
    else if (playingGameInfo.gameMode === 'obstacle' && checkObstacle(info) === 'obCenter')
      return resObstacle(info, id, 'obCenter');
    else if (playingGameInfo.gameMode === 'obstacle' && checkObstacle(info) === 'obLeft')
      return resObstacle(info, id, 'obLeft');
    else if (playingGameInfo.gameMode === 'obstacle' && checkObstacle(info) === 'obRight')
      return resObstacle(info, id, 'obRight');
    else {
      if (playingGameInfo.gameMode === 'speed')
        return id === 'X' ? info.ballP_X + info.ballVelo_X * 2 : info.ballP_Y + info.ballVelo_Y * 2;
      else return id === 'X' ? info.ballP_X + info.ballVelo_X : info.ballP_Y + info.ballVelo_Y;
    }
  };

  // 어떤 플레이어가 계산할 차례인지를 반환합니다.
  const getTurn = (info: GameInfo) => {
    switch (testReturn(info)) {
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
  const getXvelo = (info: GameInfo) => {
    // console.log(`처음 상태가 뭔디 ${testReturn(info)},, ${info.ballVelo_X}`);
    switch (testReturn(info)) {
      case 'leftgoal':
        return changeVelo(info, 'leftgoal', 'ballP_X');
      case 'rightgoal':
        return changeVelo(info, 'rightgoal', 'ballP_X');
      case 'leftHit':
        return changeVelo(info, 'leftHit', 'ballP_X');
      case 'rightHit':
        return changeVelo(info, 'rightHit', 'ballP_X');
      case 'upHit':
        return changeVelo(info, 'upHit', 'ballP_X');
      case 'downHit':
        return changeVelo(info, 'downHit', 'ballP_X');
      case 'obstacleHit':
        return changeVelo(info, 'obstacleHit', 'ballP_X');
      default:
        return changeVelo(info, 'defualt', 'ballP_X');
    }
  };

  // 상태에 맞게 밸로시티y 변경함수 호출
  const getYvelo = (info: GameInfo) => {
    switch (testReturn(info)) {
      case 'leftgoal':
        return changeVelo(info, 'leftgoal', 'ballP_Y');
      case 'rightgoal':
        return changeVelo(info, 'rightgoal', 'ballP_Y');
      case 'leftHit':
        return changeVelo(info, 'leftHit', 'ballP_Y');
      case 'rightHit':
        return changeVelo(info, 'rightHit', 'ballP_Y');
      case 'upHit':
        return changeVelo(info, 'upHit', 'ballP_Y');
      case 'downHit':
        return changeVelo(info, 'downHit', 'ballP_Y');
      case 'obstacleHit':
        return changeVelo(info, 'obstacleHit', 'ballP_Y'); // 넣지도 않고 반영되길 바라다니.. 한심아.
      default:
        return changeVelo(info, 'defualt', 'ballP_Y');
    }
  };

  // 상대의 실점을 기록합니다(계산하는 유저입장에서)
  const getCheckPoint = (info: GameInfo) => {
    switch (testReturn(info)) {
      case 'leftgoal':
        return true;
      case 'rightgoal':
        return true;
      default:
        return false;
    }
  };

  // 플레이어의 패들위치를 반환합니다.
  const getPaddlePos = (player: string | null, info: GameInfo, pos: string) => {
    if (pos === 'left') {
      if (player === 'p1') return mouseY ? mouseY : info.leftPaddlePos;
      else return paddlepaddle[0];
    } else {
      if (player === 'p2') return mouseY ? mouseY : info.rightPaddlePos;
      else return paddlepaddle[1];
    }
  };

  const calValue = async (info: GameInfo) => {
    setGameInfo({
      ...info,
      ballP_X: ballAction(info, 'X'),
      ballP_Y: ballAction(info, 'Y'),
      leftPaddlePos: getPaddlePos(player, info, 'left'),
      rightPaddlePos: getPaddlePos(player, info, 'right'),
      player: player === 'p1' ? 1 : 2,
      ballVelo_X: getXvelo(info),
      ballVelo_Y: getYvelo(info),
      turn: getTurn(info),
      checkPoint: getCheckPoint(info),
    });
  };
  const calculate = async (info: GameInfo) => {
    // 사용하면 React는 이 내부 함수에서 제공하는 상태 스냅샷이 항상 최신 상태 스냅샷이 되도록 보장하며 모든 예약된 상태 업데이트를 염두에 두고 있다.
    // 이것은 항상 최신 상태 스냅샷에서 작업하도록 하는 더 안전한 방법이다.
    // 따라서 상태 업데이트가 이전 상태에 따라 달라질 때마다 여기에서 이 함수 구문을 사용하는 것이 좋다.
    // 이전에 패들좌표보내는조건 player === 'p1' && calculateOn[0] === false || player === 'p2' && calculateOn[1] === false
    if (user && user.socket && user.socket.connected) {
      if (
        (player === 'p1' && calculateOn[0] === true) ||
        (player === 'p2' && calculateOn[1] === true)
      ) {
        await calValue(info);
        user.socket.emit('calculatedRTData', info);
      } else if ((player === 'p1' && info.turn === 2) || (player === 'p2' && info.turn === 1))
        user.socket.emit('paddleRTData', mouseY);
    }
  };

  // 서버가 보내준 갱신데이터를 받습니다.
  // p1, p2가 모두 받아옵니다(계산하는쪽은 상대방 패들위치, 안하는쪽은 그릴 모든 데이터 필요)
  // 그대로 계산안하는쪽 useState에 초당 60번씩 setting하면 좋겠지만, 렉이 심하게 걸려서 우회했습니다.
  // 그리하야, 자신이 계산할 차례가 되는순간에만 받아온값을 setting하고, 이후 계산을 시작합니다.
  const getData = async () => {
    if (user && user.socket) {
      user.socket.on('gameFinished', () => {
        if (user && playingGameInfo.gameLadder === true) {
          user.socket.emit('roomTerminated', roomid);
          user.socket.disconnect();
        }
        playing[0] = false;
        playing[1] =
          point[0] > point[1]
            ? playingGameInfo.oneNickname.toUpperCase()
            : playingGameInfo.twoNickname.toUpperCase();
        defaultGameinfo();
      });
      ///////
      user.socket.on('rtData', async (data: number[]) => {
        ballball[0] = data[0];
        ballball[1] = data[1];
        if (data[4]) paddlepaddle[0] = data[4]; //마우스가 움직일때만 받아야 최신
        if (data[5]) paddlepaddle[1] = data[5]; //마우스가 움직일때만 받아야 최신
        if (point[0] !== data[8]) point[0] = data[8]; //left score
        if (point[1] !== data[9]) point[1] = data[9]; //right score
        if (data[6] === 1) {
          // calculateOn[0] = true;
          calculateOn[1] = false; //p1이 계산중이면, p2는 아닌거지.
        }
        if (data[6] === 2) {
          calculateOn[0] = false; // calculateOn[1] = true;
        } //p2가 계산중이면, p1는 아닌거지.
        // 플레이어 turn이 바껴버리는 그순간에 값이 렌더링순서로 인해 넘어오질 않았다. (calculateOn사용이유)
        if (
          (data[6] === 2 && player === 'p2' && calculateOn[1] === false) ||
          (data[6] === 1 && player === 'p1' && calculateOn[0] === false)
        ) {
          if (player === 'p2') {
            calculateOn[0] = false;
            calculateOn[1] = true;
          } else if (player === 'p1') {
            calculateOn[0] = true;
            calculateOn[1] = false;
          }
          // setGameInfo({
          //   ...gameInfo,
          //   ballP_X: data[0],
          //   ballP_Y: data[1],
          //   ballVelo_X: data[2],
          //   ballVelo_Y: data[3],
          //   leftPaddlePos: player === 'p2' ? paddlepaddle[0] : mouseY ? mouseY : paddlepaddle[0],
          //   rightPaddlePos: player === 'p1' ? paddlepaddle[1] : mouseY ? mouseY : paddlepaddle[1],
          //   player: player === 'p2' ? 2 : 1,
          //   turn: data[6],
          // });
          setGameInfo({
            ...gameInfo,
            ballP_X: ballball[0],
            ballP_Y: ballball[1],
            ballVelo_X: data[2],
            ballVelo_Y: data[3],
            leftPaddlePos: player === 'p2' ? paddlepaddle[0] : mouseY ? mouseY : paddlepaddle[0],
            rightPaddlePos: player === 'p1' ? paddlepaddle[1] : mouseY ? mouseY : paddlepaddle[1],
            turn: data[6],
          });

          //setModal(CHECK_SCORE);
        }
      });
    } else console.log('ERROR: user undefined');
    return () => {
      defaultGameinfo();
    };
  };

  let mouseY: number;

  document.addEventListener('keydown', keyDownHandler, false);
  function keyDownHandler(e: KeyboardEvent) {
    // console.log(`키이벤트 ${e.code}, ${e.key}`);
    if (player === 'p1' || player === 'p2') {
      if (!mouseY) mouseY = player === 'p1' ? gameInfo.leftPaddlePos : gameInfo.rightPaddlePos;
      if (
        e.key === 'ArrowRight' &&
        ((player === 'p2' && mouseY > 2) || (player === 'p1' && mouseY < 78))
      )
        mouseY += player === 'p1' ? 2 : -2;
      // 키코드 줄 왜저렇게 나오지.
      else if (
        e.key === 'ArrowLeft' &&
        ((player === 'p1' && mouseY > 2) || (player === 'p2' && mouseY < 78))
      )
        mouseY += player === 'p1' ? -2 : 2;
    }
  }

  useEffect(() => {
    getData();
    return () => {
      console.log('jusnelee: 여기 들어오는순간. 끝났다는것이지.');
      playing[0] = true;
      paddlepaddle[0] = 40;
      paddlepaddle[1] = 40;
      calculateOn[0] = true;
      calculateOn[1] = false;
      defaultGameinfo();
      if (user)
        if (user.socket) {
          console.log('socket disconnect:' + user.socket.id);
          user.socket.disconnect();
        }
    };
  }, [user && user.socket, calculateOn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d', { alpha: false });
      if (user && user.socket && user.socket.connected && canvas) {
        if (ctx) {
          const test = setInterval(() => {
            calculate(gameInfo);
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
  }, [calculate]);

  // true니까 여기로 넘어와버리고, 방만들기라서, 소켓이 없으니까 else로가면, 결과페이지가 나오는거임.
  // 음... 해결방법 모색은 두가지 생각해볼수있는데, 사용후false상태인 gamestart변수를 다시 false로 되돌리는거
  // 다른하나는, 분기조건을 다른방식으로 하는법.
  // 오늘은 이거 해결하고, 지호킴님이 백엔드 해결해놓으면, 합쳐서 테스트한다.
  // 앞에서 소켓을 연결해버리니까 이제 소켓이 무조건 있어버리네,
  if (playing[0] === true) {
    return (
      <Background>
        <GameRoomContainer>
          <Header type={GAME} />
          <GameRoomBody>
            <GameArea>
              <canvas ref={canvasRef} id="canvas" width="1000" height="700" />;
            </GameArea>
          </GameRoomBody>
        </GameRoomContainer>
      </Background>
    );
  } else {
    return (
      <Background>
        <GameRoomContainer>
          <Header type={GAME} />
          <GameRoomBody>
            <ResultArea>
              <Message>{`🏆${playing[1]}🏆`}</Message>
              <Message>.......</Message>
              <Message>WINNER!</Message>
              <Message>WINNER!</Message>
              <Message>CHICKEN</Message>
              <Message>DINNER!</Message>
            </ResultArea>
          </GameRoomBody>
        </GameRoomContainer>
      </Background>
    );
  }
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

// 리렌더 방지 memo
export default React.memo(GameStart);
