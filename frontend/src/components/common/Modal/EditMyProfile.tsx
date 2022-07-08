import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import Button from '../Button';
import Modal from '.';

import axios from 'axios';
import ProfileImage from '../ProfileImage';

const EditMyProfile: React.FC = () => {
  const [user, setUser] = useState({
    picture: '',
  });

  useEffect(() => {
    axios.get(`http://localhost:4000/user_info2`).then(res =>
      setUser({
        picture: res.data.picture,
      }),
    );
  }, []);
  return (
    <Modal width={450} height={530} title={'내 프로필 수정'}>
      <MainBlock>
        <ProfileBlock>
          <ProfileImage src={user.picture} size={150} />
        </ProfileBlock>
        <RecordBtn>
          <Button color="gradient" text="프로필 업로드" width={120} height={30} />
        </RecordBtn>
        <Nick>
          <Nickguide>닉네임 :</Nickguide>
          <NickInput
            type="text"
            //   onChange={onEditNick}
            //   onKeyDown={onKeyEnter}
            //   defaultValue={nickName}
            required
          />
          <CheckDuplicate>중복 체크</CheckDuplicate>
          <DupMsg>와우 빡빡이 친구들</DupMsg>
        </Nick>
        <RecordBtn>
          <Button color="gradient" text="확인" width={120} height={30} />
        </RecordBtn>
      </MainBlock>
    </Modal>
  );
};

const MainBlock = styled.div`
  padding: 13px;
  margin-top: 50px;
  width: 100%;
`;

const ProfileBlock = styled.div`
  height: 150px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RecordBtn = styled.div`
  margin-top: 20px;
  & button {
    border-radius: 5px;
  }
`;

const Nick = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 70px;
`;

const Nickguide = styled.span`
  width: 59px;
  height: 21px;
  font-size: 18px;
`;

const NickInput = styled.input`
  display: inline;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid;
  width: 140px;
  height: 24px;
  margin: 1%;
  outline: none;
`;

const CheckDuplicate = styled.button`
  width: 90px;
  height: 30px;
  background: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.main};
  border-radius: 5px;
  font-size: 14px;

  text-align: center;
  cursor: pointer;
  color: ${props => props.theme.colors.gradient};
`;

const DupMsg = styled.span`
  margin-top: 5px;
  display: block;
  color: ${props => props.theme.colors.red};
  font-size: 14px;
`;

export default EditMyProfile;
