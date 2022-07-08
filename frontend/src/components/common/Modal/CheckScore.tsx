import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Button from '../Button';
import axios from 'axios';
import Modal from '.';
import ProfileImage from '../ProfileImage';
import { IGameRecord } from '../../../utils/interface';

const CheckScore: React.FC = () => {
  const [record, setRecord] = useState<IGameRecord[] | []>([]);

  useEffect(() => {
    axios.get('http://localhost:4000/userlist').then(({ data }) => {
      setRecord(data);
    });
  }, []);

  return (
    <Modal width={450} height={450} title={'전적 확인'}>
      <MainBlock>
        <RecordList>
          {record.map((record: IGameRecord, index: number) => (
            <RecordContainer key={index}></RecordContainer>
          ))}
        </RecordList>
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

const RecordContainer = styled.div`
  ::-webkit-scrollbar {
    display: none;
  }
  :hover {
    ::-webkit-scrollbar {
      display: block;
      width: 4px;
      background-color: ${props => props.theme.colors.grey};
    }
  }
  // 내눈이 편안하기위한 마진탑 임. 반박시 니말이맞음
  margin-top: 12px;
  overflow-y: scroll;
  height: calc(100% - 52px);
  width: 270px;
`;

const RecordList = styled.ul`
  ::-webkit-scrollbar {
    display: none;
  }
  :hover {
    ::-webkit-scrollbar {
      display: block;
      width: 4px;
      background-color: ${props => props.theme.colors.grey};
    }
    ::-webkit-scrollbar-thumb {
      background-color: ${props => props.theme.colors.main};
      border-radius: 10px;
    }
  }
  // 내눈이 편안하기위한 마진탑 임. 반박시 니말이맞음
  margin-top: 12px;
  overflow-y: scroll;
  height: calc(100% - 52px);
  width: 270px;
`;

//============================================

//=============================================

export default CheckScore;
