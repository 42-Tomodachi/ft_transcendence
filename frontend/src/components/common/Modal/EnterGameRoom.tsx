import React, { useState, useContext } from 'react';
import styled from '@emotion/styled';
import Button from '../Button';
import Modal from '.';
import { AllContext } from '../../../store';

const EnterGameRoom: React.FC = () => {
  const [errMsg, setErrMsg] = useState<string>('');
  const [inputPwd, setPwd] = useState<string>('');
  const { setModal } = useContext(AllContext).modalData;

  const comparePwd = () => {
    if (inputPwd === '1234') {
      setErrMsg('');
      alert(`정답ㅋ`);
    } else {
      setErrMsg('잘못된 비밀번호입니다.');
      setPwd('');
    }
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      comparePwd();
    }
  };

  return (
    <Modal width={570} height={250} title={'게임방 입장'}>
      <MainBlock>
        <PwdText>비밀번호를 입력해주세요.</PwdText>
        <InputPwd
          type="password"
          onChange={event => {
            setPwd(event.target.value);
            setErrMsg('');
          }}
          value={inputPwd}
          onKeyPress={handleEnter}
        />
        <CheckerText>{errMsg}</CheckerText>
        <BtnBlock>
          <Button
            color="white"
            text="취소"
            width={150}
            height={40}
            onClick={() => setModal(null)}
          />
          <Button color="gradient" text="입장하기" width={150} height={40} onClick={comparePwd} />
        </BtnBlock>
      </MainBlock>
    </Modal>
  );
};

//Main Block
const MainBlock = styled.div`
  padding: 13px;
  width: 100%;
`;
//============================================

//============================================
//PwdText
const PwdText = styled.span`
  display: block;
  width: 250px;
  text-align: center;
  margin: 0 auto;
  font-size: 16px;
  font-weight: 400;
`;
//Input
const InputPwd = styled.input`
  display: block;
  margin: 0 auto;
  margin-top: 25px;
  width: 250px;
  text-align: center;
  border: none;
  outline: none;
  border-bottom: 1px solid;
`;
//CheckerText
const CheckerText = styled.span`
  display: block;
  width: 250px;
  height: 14px;
  text-align: center;
  margin: 0 auto;
  margin-top: 5px;
  font-size: 12px;
  font-weight: 400;
  color: #ff6363;
`;
//============================================

//BtnSection
const BtnBlock = styled.div`
  margin-top: 15px;
  display: flex;
  justify-content: center;
  & button {
    border-radius: 5px;
    margin: 0;
    &:last-of-type {
      margin-left: 40px;
    }
  }
`;
//============================================

export default EnterGameRoom;
