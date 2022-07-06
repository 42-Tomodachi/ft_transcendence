import React, { useContext } from 'react';
import LadderModal from '../../Game/LadderModal';
import { AllContext } from '../../../store';
import LogoutModal from './LogoutModal';
import ShowProfile from './ShowProfile';
import MakeGameRoom from './MakeGameRoom';
import MakeChatRoom from './MakeChatRoom';
import EnterGameRoom from './EnterGameRoom';
import EnterChatRoom from './EnterChatRoom';
import ShowOwnerProfile from './ShowOwnerProfile';
import ShowManagerProfile from './ShowManagerProfile';
import OnSecondAuth from './OnSecondAuth';
import EditNickName from './EditNickName';
import SettingRoom from './SettingRoom';
import FightResModal from './FightResModal';
import FightReqModal from './FightReqModal';
import OffSecondAuth from './OffSecondAuth';

const ModalSet: React.FC = () => {
  const { modal } = useContext(AllContext).modalData;
  return (
    <>
      {modal.modal &&
        {
          LOADING_LADDER_GAME: <LadderModal />, // 레더 게임 매칭
          FIGHT_RES_MODAL: <FightResModal id={modal.id} />, // 1:1 대전 응답 모달
          FIGHT_REQ_MODAL: <FightReqModal id={modal.id} />, // 1:1 대전 요청 모달
          SHOW_PROFILE: <ShowProfile id={modal.id} />, // 프로필 정보 보기
          ON_SECOND_AUTH: <OnSecondAuth />, // 2차 인증 켜기
          OFF_SECOND_AUTH: <OffSecondAuth />, // 2차 인증 끄기
          EDIT_NICKNAME: <EditNickName />, // 닉네임 수정
          MAKE_GAME_ROOM: <MakeGameRoom />, // 게임방 만들기
          MAKE_CHAT_ROOM: <MakeChatRoom />, // 채팅방 만들기
          ENTER_GAME_ROOM: <EnterGameRoom />, // 비밀 게임방 입장
          ENTER_CHAT_ROOM: <EnterChatRoom />, // 비밀 채팅방 입장
          CHECK_SCORE: <></>, // 전적 확인 (TODO junselee)
          EDIT_CHAT_ROOM: <SettingRoom />, // 채팅방 수정
          SHOW_OWNER_PROFILE: <ShowOwnerProfile id={modal.id} />, // 채팅방 소유자 프로필
          SHOW_MANAGER_PROFILE: <ShowManagerProfile id={modal.id} />, // 채팅방 관리자 프로필
          CHECK_LOGOUT: <LogoutModal />, // 로그아웃 확인
        }[modal.modal]}
    </>
  );
};

export default ModalSet;
