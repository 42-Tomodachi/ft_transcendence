import React, { useContext } from 'react';
import styled from '@emotion/styled';
import Modal from '.';
import Button from '../Button';
import { AllContext } from '../../../store';
import { LOGOUT } from '../../../utils/interface';
import { useNavigate } from 'react-router-dom';

const LogoutModal: React.FC = () => {
  const { setModal } = useContext(AllContext).modalData;
  const { setUserStatus } = useContext(AllContext).userStatus;
  const { setUser } = useContext(AllContext).userData;
  const { setJwt } = useContext(AllContext).jwtData;
  const navigater = useNavigate();

  const handleLogout = () => {
    setUserStatus(LOGOUT);
    setUser(LOGOUT);
    setJwt('REMOVE_JWT');
    setModal(null); // 모달 끄기
    navigater('/'); // TODO: 초기화면으로 이동
    // TODO: 로그아웃 후 초기화면에서 뒤로가기를 못하게 막아야함
  };

  return (
    <Modal width={400} height={180}>
      <LogoutMsg>정말 로그아웃 하시겠습니까?</LogoutMsg>
      <CancelBtnWrap>
        <Button width={110} height={30} color="white" text="취소" onClick={() => setModal(null)} />
        <Button width={110} height={30} color="main" text="확인" onClick={handleLogout} />
      </CancelBtnWrap>
    </Modal>
  );
};

const LogoutMsg = styled.h3`
  margin-top: 20px;
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
