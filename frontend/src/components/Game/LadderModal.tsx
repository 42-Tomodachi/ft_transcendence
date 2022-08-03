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
    socket = io(`${process.env.REACT_APP_BACK_API}`, {
      //REACT_APP_BACK_API_B
      //socket = io('http://localhost:5500/', {
      // socket = io('http://10.19.210.94:5500/', {
      // socket = io('process.env.REACT_APP_BACK_API_A', {
      //socket = io('http://3.34.203.69:5500/', {
      transports: ['websocket'], // 웹소켓으로 간다는걸 알려준다. 구글링.
      query: {
        userId: user?.userId,
      },
    });
    if (user) user.socket = socket;
    socket.on('message', () => {
      console.log(`connected socket : ${socket.id}`);
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
            onClick={() => {
              socket.emit('cancelLadderQueue');
              setModal(null);
            }}
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
