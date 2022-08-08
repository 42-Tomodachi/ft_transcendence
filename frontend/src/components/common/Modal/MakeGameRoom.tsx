import React, { useContext, useState } from 'react';
import styled from '@emotion/styled';
import Button from '../Button';
import Modal from '.';
import { useNavigate } from 'react-router-dom';
import { AllContext } from '../../../store';
import { gameAPI } from '../../../API';
import { GameMode } from '../../../utils/interface';
// import { Radio } from 'antd';
// import type { RadioChangeEvent } from 'antd';

const MakeGameRoom: React.FC = () => {
  const { user } = useContext(AllContext).userData;
  const { setModal } = useContext(AllContext).modalData;
  const [roomName, setRoomName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errMsg, setErrMsg] = useState<string>('');
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const navigate = useNavigate();
  const roomSettingValues = {
    MAXROOMNAMESIZE: 10,
    MAXPASSWORDSIZE: 10,
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'roomName') {
      if (e.target.value.length <= roomSettingValues.MAXROOMNAMESIZE) setRoomName(e.target.value);
      else setErrMsg(`방 제목은 최대 ${roomSettingValues.MAXROOMNAMESIZE} 글자 입니다.`);
    } else if (e.target.name === 'password') {
      if (e.target.value.length <= roomSettingValues.MAXPASSWORDSIZE)
        setPassword(e.target.value.trim());
      else setErrMsg(`방 비밀번호는 최대 ${roomSettingValues.MAXPASSWORDSIZE} 글자 입니다.`);
    }
  };

  const createGame = async () => {
    if (roomName.trim().length === 0) {
      setErrMsg('방 제목은 최소 한 글자 이상 입력해주세요.');
      return;
    }
    if (user) {
      const res = await gameAPI.makeGameRoom(
        user.userId,
        roomName,
        password.length ? password : null,
        gameMode,
        user.jwt,
      );
      if (res && res.gameId) {
        setModal(null);
        navigate(`/gameroom/${res.gameId}`);
      }
      // TODO : 실패시 로직 처리
    }
  };

  // const onChange3 = (e: RadioChangeEvent) => {
  //   console.log('radio3 checked', e.target.value);
  //   setValues(e.target.value);
  // };
  return (
    <Modal width={570} height={300} title={'게임방 만들기'}>
      <MainBlock>
        <TextGridBlock>
          <RoomNPwd>게임모드</RoomNPwd>
          {/* <Radio.Group onChange={onChange3} value={values} defaultValue="Normal">
            <RadioButton value="Obstacle">장애물</RadioButton>
            <RadioButton value="SpeedUp">스피드업</RadioButton>
            <RadioButton value="Normal">일반</RadioButton>
          </Radio.Group> */}
          <RoomNPwd>방 제목</RoomNPwd>
          <InputRoomName
            type="text"
            onChange={onChangeInput}
            value={roomName}
            name="roomName"
            spellCheck={false}
          />
          <RoomNPwd>비밀번호</RoomNPwd>
          <InputPwd type="password" name="password" onChange={onChangeInput} value={password} />
        </TextGridBlock>
        {/* TODO: 스피드업, 장애물 생성, 일반모드 radio로 버튼 추가 */}
        <ErrMsg>{errMsg}</ErrMsg>
        <BtnBlock>
          <Button color="gradient" text="만들기" width={200} height={40} onClick={createGame} />
        </BtnBlock>
      </MainBlock>
    </Modal>
  );
};

// Main Block
const MainBlock = styled.div`
  padding: 13px;
  margin-top: 23px;
  width: 100%;
`;
//============================================

//InputSection
const TextGridBlock = styled.div`
  margin-left: 30px;
  margin-right: 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 15px 10px;
`;

const RoomNPwd = styled.span`
  width: 75px;
  font-size: 20px;
  font-weight: 400;
  text-align: center;
`;

const InputRoomName = styled.input`
  width: 250px;
  border: none;
  outline: none;
  border-bottom: 1px solid;
  text-align: center;
`;

const InputPwd = styled(InputRoomName)`
  text-align: center;
  &[type='password'] {
  }
`;
const ErrMsg = styled.span`
  display: block;
  height: 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.red};
  text-align: center;
  margin: 20px 0 10px;
`;

//============================================

//BtnSection
const BtnBlock = styled.div`
  /* margin-top: 40px; */
  & button {
    border-radius: 5px;
  }
`;
//============================================

// TODO: radio button style
// const RadioButton = styled(Radio.Button)`
//   color: black;
//   margin-right: 5px;
//   &:hover {
//     color: ${props => props.theme.colors.main};
//     box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.25);
//   }
// `;

export default MakeGameRoom;
