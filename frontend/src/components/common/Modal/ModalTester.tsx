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

import { SHOW_OWNER_PROFILE } from '../../../utils/interface';
import { SHOW_MANAGER_PROFILE } from '../../../utils/interface';

import { ON_SECOND_AUTH } from '../../../utils/interface';

import { EDIT_NICKNAME } from '../../../utils/interface';
import { EDIT_CHAT_ROOM } from '../../../utils/interface';
import { LOADING_LADDER_GAME } from '../../../utils/interface';
import { FIGHT_REQ_MODAL, FIGHT_RES_MODAL } from '../../../utils/interface';
// CHECK_SCORE;

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
            width={200}
            height={30}
            onClick={() => setModal(SHOW_PROFILE)}
          />
          <Button
            color="gradient"
            text="MakeGameRoom"
            width={200}
            height={30}
            onClick={() => setModal(MAKE_GAME_ROOM)}
          />
          <Button
            color="gradient"
            text="MakeChatRoom"
            width={200}
            height={30}
            onClick={() => setModal(MAKE_CHAT_ROOM)}
          />
          <Button
            color="gradient"
            text="EnterGameRoom"
            width={200}
            height={30}
            onClick={() => setModal(ENTER_GAME_ROOM)}
          />
          <Button
            color="gradient"
            text="EnterChatRoom"
            width={200}
            height={30}
            onClick={() => setModal(ENTER_CHAT_ROOM)}
          />
          <Button
            color="gradient"
            text="LoadingLadderGame"
            width={200}
            height={30}
            onClick={() => setModal(LOADING_LADDER_GAME)}
          />
          <Button
            color="gradient"
            text="ShowOwnerProfile"
            width={200}
            height={30}
            onClick={() => setModal(SHOW_OWNER_PROFILE)}
          />
          <Button
            color="gradient"
            text="ShowManagerProfile"
            width={200}
            height={30}
            onClick={() => setModal(SHOW_MANAGER_PROFILE)}
          />
          <Button
            color="gradient"
            text="OnSecondAuth"
            width={200}
            height={30}
            onClick={() => setModal(ON_SECOND_AUTH)}
          />
          <Button
            color="gradient"
            text="EditNickName"
            width={200}
            height={30}
            onClick={() => setModal(EDIT_NICKNAME)}
          />
          <Button
            color="gradient"
            text="SettingRoom"
            width={200}
            height={30}
            onClick={() => setModal(EDIT_CHAT_ROOM)} //
          />
          <Button
            color="gradient"
            text="FightResModal"
            width={200}
            height={30}
            onClick={() => setModal(FIGHT_RES_MODAL)} //
          />
          <Button
            color="gradient"
            text="FightReqModal"
            width={200}
            height={30}
            onClick={() => setModal(FIGHT_REQ_MODAL)} //
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
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 10px 20px;

  margin-top: 30px;
  & button {
    border-radius: 5px;
  }
`;
//============================================

export default ModalTester;
