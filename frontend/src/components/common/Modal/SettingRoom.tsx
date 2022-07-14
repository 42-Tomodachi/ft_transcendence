import React from 'react';
import styled from '@emotion/styled';
import Button from '../Button';
import Modal from '.';

const SettingRoom: React.FC = () => {
  return (
    // TODO: 따로 게임방, 채팅방 설정으로 구분?
    <Modal width={570} height={300} title={'방 설정'}>
      <MainBlock>
        <TextGridBlock>
          <RoomNPwd>방 제목</RoomNPwd>
          <InputRoomName spellCheck={false} />
          <RoomNPwd>비밀번호</RoomNPwd>
          <InputPwd type="password" />
        </TextGridBlock>
        <BtnBlock>
          <Button color="gradient" text="설정" width={200} height={40} />
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
  text-align: center;
  &[type='password'] {
  }
`;
//============================================

//BtnSection
const BtnBlock = styled.div`
  margin-top: 40px;
  & button {
    border-radius: 5px;
  }
`;
//============================================

export default SettingRoom;
