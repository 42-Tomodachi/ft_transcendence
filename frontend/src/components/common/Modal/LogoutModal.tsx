import React, { useContext } from 'react';
import styled from '@emotion/styled';
import Modal from '.';
import Button from '../Button';
import { AllContext } from '../../../store';
import { LOGOUT } from '../../../utils/interface';

const LogoutModal: React.FC = () => {
  const { setModal } = useContext(AllContext).modalData;
  const { setUserStatus } = useContext(AllContext).userStatus;
  const { setUser } = useContext(AllContext).userData;

  const handleLogout = () => {
    setUserStatus(LOGOUT);
    setUser(LOGOUT);
    // 추후에 jwt 토큰 삭제 예정
  };

  return (
    <Modal width={400} height={200}>
      <LogoutMsg>정말 로그아웃 하시겠습니까?</LogoutMsg>
      <CancelBtnWrap>
        <Button width={110} height={30} color="white" text="취소" onClick={() => setModal(null)} />
        <Button width={110} height={30} color="main" text="확인" onClick={handleLogout} />
      </CancelBtnWrap>
    </Modal>
  );
};

const LogoutMsg = styled.h3`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
`;
const CancelBtnWrap = styled.div`
  margin: 30px 0;
  display: flex;
  justify-content: center;
  align-items: center;

  & button {
    margin: 0;
    margin-right: 10px;
  }
`;

export default LogoutModal;
