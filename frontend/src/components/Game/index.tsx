import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
import Button from '../common/Button';
import GameList from '../RoomList';
import { AllContext } from '../../store';
import { LOADING_LADDER_GAME, IGameRooms, MAKE_GAME_ROOM, GAME } from '../../utils/interface';
//import io from 'socket.io-client'; // 아이오 연결하고.
//import { useNavigate } from 'react-router-dom';

const Game: React.FC = () => {
  const [gameList, setGameList] = useState<IGameRooms[] | []>([]);
  const { setModal } = useContext(AllContext).modalData;
  //const navigate = useNavigate();

  useEffect(() => {
    const getGameList = async () => {
      const { data } = await axios('http://localhost:4000/gameList');
      setGameList(data);
    };
    getGameList();
  }, []);
  const creatMatch = async () => {
    console.log('creatMatch!!!!!!');
    //모달 표시해주고
    setModal(LOADING_LADDER_GAME);
    //await new Promise(resolve => setTimeout(resolve, 3000));

    // 이후에 모달이 사라지고 네비게이터로 작성된 페이지로 이동..
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
