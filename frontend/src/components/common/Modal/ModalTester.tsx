import React, { useContext } from 'react';
import styled from '@emotion/styled';
import Button from '../Button';

import ModalSet from './ModalSet';
import { AllContext } from '../../../store';
import { SHOW_PROFILE } from '../../../utils/interface';
import { MAKE_GAME_ROOM } from '../../../utils/interface';
import { MAKE_CHAT_ROOM } from '../../../utils/interface';
import { ENTER_GAME_ROOM } from '../../../utils/interface';
import { ENTER_CHAT_ROOM } from '../../../utils/interface';

// import { SHOW_PROFILE } from '../../../utils/interface'
// import { SHOW_PROFILE } from '../../../utils/interface'

// HANDLE_SECOND_AUTH;
// EDIT_NICKNAME;
// MAKE_GAME_ROOM;
// MAKE_CHAT_ROOM;
// ENTER_GAME_ROOM;
// ENTER_CHAT_ROOM;
// CHECK_SCORE;
// LOADING_LADDER_GAME;
// EDIT_CHAT_ROOM;
// SHOW_OWNER_PROFILE;
// SHOW_MANAGER_PROFILE;
// CHECK_LOGOUT;

const ModalTester: React.FC = () => {
  const { setModal } = useContext(AllContext).modalData;

  return (
    <>
      <MainBlock>
        <OtherBtnBlock>
          <Button
            color="gradient"
            text="View Profile"
            width={120}
            height={30}
            onClick={() => setModal(SHOW_PROFILE)}
          />
          <Button
            color="gradient"
            text="MakeGameRoom"
            width={120}
            height={30}
            onClick={() => setModal(MAKE_GAME_ROOM)}
          />
          <Button
            color="gradient"
            text="MakeChatRoom"
            width={120}
            height={30}
            onClick={() => setModal(MAKE_CHAT_ROOM)}
          />
          <Button
            color="gradient"
            text="EnterGameRoom"
            width={120}
            height={30}
            onClick={() => setModal(ENTER_GAME_ROOM)}
          />
          <Button
            color="gradient"
            text="EnterChatRoom"
            width={120}
            height={30}
            onClick={() => setModal(ENTER_CHAT_ROOM)}
          />
        </OtherBtnBlock>
      </MainBlock>
      <ModalSet />
    </>
  );
};

// Main Block
const MainBlock = styled.div`
  border: 2px solid ${props => props.theme.colors.main};
  border-radius: 20px;
  width: 100%;
  height: 100%;
  padding: 25px;
  padding: 25px;
  font-weight: 400;
`;
//OtherBtnSection
const OtherBtnBlock = styled.div`
  display: flex;
  justify-content: space-between;
  & button {
    border-radius: 5px;
    margin: 0;
    &:last-of-type {
      margin-left: 10px;
    }
  }
`;
//============================================

export default ModalTester;
