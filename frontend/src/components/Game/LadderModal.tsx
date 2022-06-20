import React, { useContext } from 'react';
import styled from '@emotion/styled';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AllContext } from '../../store';

const LadderModal: React.FC = () => {
  const { setModal } = useContext(AllContext).modalData;

  return (
    <Modal width={400} height={200}>
      <LadderMsg>래더 게임 매칭중 입니다</LadderMsg>
      <CancelBtnWrap>
        <Button width={110} height={30} color="white" text="취소" onClick={() => setModal(null)} />
      </CancelBtnWrap>
    </Modal>
  );
};

const LadderMsg = styled.h3`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
`;

const CancelBtnWrap = styled.div`
  margin: 30px 0;
`;

export default LadderModal;
