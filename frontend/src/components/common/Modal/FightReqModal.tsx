import React, { useContext } from 'react';
import styled from '@emotion/styled';
import Modal from '.';
import Button from '../Button';
import { AllContext } from '../../../store';

const FightReqModal: React.FC<{ id: number }> = ({ id }) => {
  const { setModal } = useContext(AllContext).modalData;
  const acceptFight = () => {
    console.log('수락했습니다.');
  };
  const cancelFight = () => {
    console.log('대결을 취소했습니다(신청받은 사람)');
    setModal(null);
  };
  return (
    <Modal width={400} height={200}>
      <ModalWrap>
        {/* TODO : 대전신청한 유저의 이름이 AAA에 들어가야함 */}
        <FightMsg>AAA 님에게</FightMsg>
        <FightMsg>대전 신청이 왔습니다.</FightMsg>
        <BtnBlock>
          <Button color="white" text="취소" width={110} height={30} onClick={cancelFight} />
          <Button color="gradient" text="수락" width={110} height={30} onClick={acceptFight} />
        </BtnBlock>
      </ModalWrap>
    </Modal>
  );
};

const FightMsg = styled.h3`
  font-size: 20px;
  font-weight: bold;
  line-height: 23px;
  text-align: center;
`;

const ModalWrap = styled.div`
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const BtnBlock = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  & button {
    font-size: 14px;
    border-radius: 5px;
    margin: 0;
    &:last-of-type {
      margin-left: 20px;
    }
  }
`;
export default FightReqModal;
