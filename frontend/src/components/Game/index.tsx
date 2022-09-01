import React, { useState, useEffect, useContext } from 'react';
import styled from '@emotion/styled';
import Button from '../common/Button';
import GameList from '../RoomList';
import { AllContext } from '../../store';
import { LOADING_LADDER_GAME, IGameRooms, MAKE_GAME_ROOM, GAME } from '../../utils/interface';
import { gameAPI } from '../../API';
import { Socket } from 'socket.io-client';

const Game: React.FC<{ socket: Socket }> = ({ socket }) => {
  const [gameList, setGameList] = useState<IGameRooms[] | []>([]);
  const { user } = useContext(AllContext).userData;
  const { setModal } = useContext(AllContext).modalData;
  //const navigate = useNavigate();

  useEffect(() => {
    if (user && user.jwt) {
      getAllGameList(user.jwt);
    }
  }, []);

  useEffect(() => {
    if (socket) {
      // TODO: 게임 룸 리스트 이벤트 명 확인하기(알려주기)
      socket.on('updateGameRoomList', (data: IGameRooms[]) => {
        console.log('update gameroom', data);
        setGameList(data); // 전체 게임방
      });
    }
    return () => {
      if (socket) {
        socket.off('updateChatRoomList');
        // socket.disconnect();
      }
    };
  }, [socket]);

  const creatMatch = async () => {
    console.log('junselee: 래더게임매칭버튼이 눌렸고, 이제 모달을 띄울거다.(Game/)');
    //모달 표시해주고
    setModal(LOADING_LADDER_GAME);
    //await new Promise(resolve => setTimeout(resolve, 3000));

    // 이후에 모달이 사라지고 네비게이터로 작성된 페이지로 이동..
  };

  const getAllGameList = async (jwt: string) => {
    const res = await gameAPI.getGameRooms(jwt); //
    setGameList(res);
  };
  return (
    <>
      <LadderGame>
        <Button
          width={120}
          height={40}
          color="white"
          text="방 만들기"
          onClick={() => setModal(MAKE_GAME_ROOM)}
        />
        <Button
          width={160}
          height={40}
          color="gradient"
          text="래더 게임 매칭"
          onClick={creatMatch}
        />
      </LadderGame>
      {/* TODO: 게임방이 하나도 없을 때 하나도 없다는걸 보여주는 info 컴포넌트 필요 */}
      <GameList list={gameList} type={GAME} />
    </>
  );
};

const LadderGame = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 10px;
  button {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    &:last-of-type {
      margin-left: 10px;
    }
  }
`;

export default Game;
