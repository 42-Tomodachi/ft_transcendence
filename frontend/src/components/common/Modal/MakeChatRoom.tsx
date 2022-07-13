import React, { useContext, useState } from 'react';
import styled from '@emotion/styled';
import Button from '../Button';
import Modal from '.';
import { chatsAPI } from '../../../API';
import { AllContext } from '../../../store';
import { useNavigate } from 'react-router-dom';

const MakeChatRoom: React.FC = () => {
  const { user } = useContext(AllContext).userData;
  const { setModal } = useContext(AllContext).modalData;
  const [roomName, setRoomName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errMsg, setErrMsg] = useState<string>('');
  const navigate = useNavigate();

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'roomName') {
      if (roomName.length <= 10) setRoomName(e.target.value);
    } else if (e.target.name === 'password') {
      if (password.length <= 10) setPassword(e.target.value.trim());
    }
  };

  const createRoom = async () => {
    if (roomName.trim().length === 0) {
      setErrMsg('방 제목은 최소 한 글자 이상 입력해주세요.');
      return;
    }
    if (user) {
      const res = await chatsAPI.makeChatRoom(user.userId, roomName, false, password, user.jwt);
      if (res?.roomId) {
        setModal(null);
        navigate(`/chatroom/${res.roomId}`);
      }
      // TODO : 실패시 로직 처리
    }
  };
  return (
    <Modal width={570} height={300} title={'대화방 만들기'}>
      <MainBlock>
        <TextGridBlock>
          <RoomNPwd>방 제목</RoomNPwd>
          <InputRoomName type="text" onChange={onChangeInput} value={roomName} name="roomName" />
          <RoomNPwd>비밀번호</RoomNPwd>
          <InputPwd type="password" name="password" onChange={onChangeInput} value={password} />
        </TextGridBlock>
        <ErrMsg>{errMsg}</ErrMsg>
        <BtnBlock>
          <Button color="gradient" text="만들기" width={200} height={40} onClick={createRoom} />
        </BtnBlock>
      </MainBlock>
    </Modal>
  );
};

// Main Block
const MainBlock = styled.div`
  padding: 13px;
  margin-top: 50px;
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
  margin-top: 20px;
  & button {
    border-radius: 5px;
  }
`;
//============================================

export default MakeChatRoom;