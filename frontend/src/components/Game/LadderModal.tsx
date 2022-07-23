import React, { useEffect, useContext } from 'react';
import styled from '@emotion/styled';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AllContext } from '../../store';
import { io, Socket } from 'socket.io-client'; // 아이오 연결하고.
import { useNavigate } from 'react-router-dom'; //네비

let socket: Socket;

const LadderModal: React.FC = () => {
  const { setModal } = useContext(AllContext).modalData;
  const navigate = useNavigate();
  const { user } = useContext(AllContext).userData;

  useEffect(() => {
    console.log('modal!!!!!!!!!');
    socket = io('http://10.19.226.170:5500/', {
      query: {
        userId: user?.userId,
      },
    });
    if (user) user.socket = socket;
    console.log(socket.connected ? 'hello mother fucker' : 'hello father fucker');
    socket.on('message', () => {
      console.log('hello mother fucker');
      console.log(socket.connected); // true
    });

    // 래더매치를 신청한 유저이름을 서버로 보내고,
    const data = user?.userId;
    console.log('유저아이디 뭐야 : ' + data);
    socket.emit('newLadderGame', data);

    // 매치가 완료됐다고 서버한테 연락받으면
    socket.on('matchingGame', (roomId: number) => {
      setModal(null);
      if (user) user.roomid = roomId;
      navigate(`/gameroom/`); //GamePage.tsx
    });
  }, []);
  return (
    <Modal width={400} height={200}>
      <ModalWrap>
        <LadderMsg>래더 게임 매칭중 입니다</LadderMsg>
        <CancelBtnWrap>
          <Button
            width={110}
            height={30}
            color="white"
            text="취소"
            onClick={() => setModal(null)}
          />
        </CancelBtnWrap>
      </ModalWrap>
    </Modal>
  );
};

const LadderMsg = styled.h3`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  display: block;
  margin-top: 30px;
`;

const ModalWrap = styled.div``;

const CancelBtnWrap = styled.div`
  margin-top: 30px;
  & button {
    font-size: 18px;
    border-radius: 5px;
  }
`;

export default LadderModal;
