import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
import Button from '../common/Button';
import GameList from '../RoomList';
import { AllContext } from '../../store';
import { LOADING_LADDER_GAME, IRoomList, MAKE_GAME_ROOM } from '../../utils/interface';

const Game: React.FC = () => {
  const [gameList, setGameList] = useState<IRoomList[] | []>([]);
  const { setModal } = useContext(AllContext).modalData;

  useEffect(() => {
    const getGameList = async () => {
      const { data } = await axios('http://localhost:4000/gameList');
      setGameList(data);
    };
    getGameList();
  }, []);

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
          onClick={() => setModal(LOADING_LADDER_GAME)}
        />
      </LadderGame>
      <GameList list={gameList} />
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
