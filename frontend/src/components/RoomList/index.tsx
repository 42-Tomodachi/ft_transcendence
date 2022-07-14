import React from 'react';
import styled from '@emotion/styled';
import { IChatRooms, IGameRooms, CHAT } from '../../utils/interface';
import ChatRooms from './ChatRooms';
import GameRooms from './GameRooms';
interface RoomListProps {
  list: IChatRooms[] | IGameRooms[] | [];
  type: string;
}

const RoomList: React.FC<RoomListProps> = ({ list, type }) => {
  return (
    <RoomListContainer>
      {list.length > 0 &&
        list.map((li, index) => {
          return type === CHAT ? (
            <ChatRooms key={index} item={li as IChatRooms} />
          ) : (
            <GameRooms key={index} item={li as IGameRooms} />
          );
        })}
    </RoomListContainer>
  );
};

const RoomListContainer = styled.ul`
  display: block;
  width: 100%;
  height: calc(100% - 60px);
  overflow: auto;
`;

export default RoomList;
