import React, { useEffect, useState, useContext } from 'react';
import styled from '@emotion/styled';
import Button from '../Button';
import axios from 'axios';
import Modal from '.';
import ProfileImage from '../ProfileImage';
import { AllContext } from '../../../store';
import { IGameRecord } from '../../../utils/interface';

const CheckScore: React.FC = () => {
  const [recordList, setRecord] = useState<IGameRecord[] | []>([]);
  const { setModal } = useContext(AllContext).modalData;

  useEffect(() => {
    axios.get('http://localhost:4000/record').then(({ data }) => {
      console.log(data);
      setRecord(data);
    });
  }, []);

  return (
    <Modal width={450} height={450} title={'전적 확인'}>
      <MainBlock>
        <RecordList>
          {recordList.map((record: IGameRecord, index: number) => (
            <RecordItem key={index} isWin={record.isWin}>
              <RecordisLadder>{record.isLadder ? '래더 게임' : '일반 게임'}</RecordisLadder>
              <RecordisWin>{record.isWin ? '승' : '패'}</RecordisWin>
              <RecordNickName>{record.opponentNickname}</RecordNickName>
            </RecordItem>
          ))}
        </RecordList>
        <Button
          color="gradient"
          text="확인"
          width={200}
          height={40}
          onClick={() => setModal(null)}
        />
      </MainBlock>
    </Modal>
  );
};

// Main Block
const MainBlock = styled.div`
  margin: 0 auto;
  padding: 13px;
  width: 340px;
  & Button {
    margin-top: 25px;
  }
`;

const RecordItem = styled.div<{ isWin: boolean }>`
  margin: 0 auto;
  margin-top: 5px;
  width: 100%;
  height: 60px;

  background-color: ${props => (props.isWin ? '#c5dcff' : '#FFC5C5')};

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr;
  gap: 10px;

  border-radius: 5px;

  & span {
    display: inline-block;
    font-size: 18px;
    font-weight: 400;
    line-height: 60px;
  }
`;

const RecordList = styled.ul`
  height: 260px;
  overflow: auto;
  overflow-y: auto;
`;

const RecordisLadder = styled.span`
  width: 100%;
  text-align: center;
`;
const RecordisWin = styled.span`
  width: 100%;
  text-align: left;
  color: #ffffff;
`;
const RecordNickName = styled.span`
  width: 80%;
  text-align: right;
`;

export default CheckScore;
