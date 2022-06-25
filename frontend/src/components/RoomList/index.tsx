import React from 'react';
import styled from '@emotion/styled';
import GameListItem from './RoomListItem';
import { IRoomList } from '../../utils/interface';

interface RoomListProps {
  list: IRoomList[] | [];
  type: string;
}

const RoomList: React.FC<RoomListProps> = ({ list, type }) => {
  return (
    <RoomListContainer>
      {list.length > 0 &&
        [...list, ...list, ...list, ...list, ...list].map((li, index) => {
          return <GameListItem key={index} item={li} type={type} />;
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
