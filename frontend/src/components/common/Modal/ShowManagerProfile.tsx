import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Button from '../Button';
import axios from 'axios';
import Modal from '.';

const ShowManagerProfile: React.FC<{ id: number }> = ({ id }) => {
  const [user, setUser] = useState({
    id: '',
    user: '',
    user_nick: '',
    user_lv: '',
    gen_win: '',
    gen_lose: '',
    lad_win: '',
    lad_lose: '',
    picture: '',
  });

  useEffect(() => {
    axios.get(`http://localhost:4000/user_info`).then(res =>
      setUser({
        id: res.data.id,
        user: res.data.user,
        user_nick: res.data.user_nick,
        user_lv: res.data.user_lv,
        gen_win: res.data.gen_win,
        gen_lose: res.data.gen_lose,
        lad_win: res.data.lad_win,
        lad_lose: res.data.lad_lose,
        picture: res.data.picture,
      }),
    );
  }, []);

  return (
    <Modal width={500} height={550} title={'프로필 보기'}>
      <MainBlock>
        <ProfileBlock>
          <PictureBlock>
            <ProfilePicture src={user.picture} alt="UserProfileImage" />
          </PictureBlock>
          <UserInfo>
            <UserName>{user.user_nick}</UserName>
            <UserLevel>lv.{user.user_lv}</UserLevel>
          </UserInfo>
        </ProfileBlock>

        <RecordText>전적/래더전적</RecordText>
        <RecordBlock>
          <Record>
            {user.gen_win}승 {user.gen_lose}패/{user.lad_win}승 {user.lad_lose}패
          </Record>
          <RecordBtn>
            <Button color="white" text="전적 기록" width={97} height={30} />
          </RecordBtn>
        </RecordBlock>

        <OtherBtnBlock>
          <Button color="gradient" text="친구 추가" width={200} height={40} />
          <Button color="gradient" text="게임 신청" width={200} height={40} />
          <Button color="gradient" text="DM 보내기" width={200} height={40} />
          <Button color="white" text="차단하기" width={200} height={40} />
          <Button color="white" text="밴" width={200} height={40} />
          <Button color="white" text="뮤트" width={200} height={40} />
        </OtherBtnBlock>
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
//============================================

// Profile Section
const ProfileBlock = styled.div`
  height: 120px;
  display: flex;
`;
const UserInfo = styled.div``;

const PictureBlock = styled.div``;

const ProfilePicture = styled.img`
  width: 101px;
  height: 101px;
  border-radius: 50px;
  background: #c4c4c4;
`;

const UserName = styled.span`
  display: block;
  font-size: 20px;

  margin-top: 25px;
  margin-left: 25px;
`;

const UserLevel = styled.span`
  display: block;
  font-size: 14px;

  margin-top: 5px;
  margin-left: 25px;
`;
//============================================

//Record Section
const RecordBlock = styled.div`
  display: flex;
  justify-content: space-between;
`;

const RecordText = styled.span`
  display: inline-block;
  font-size: 20px;

  margin-top: 71px;
`;

const Record = styled.span`
  display: inline-block;
  font-size: 16px;

  margin-top: 10px;
`;

const RecordBtn = styled.div`
  margin-top: 10px;
  & button {
    color: ${props => props.theme.colors.main};
    border-radius: 5px;
  }
`;

//============================================

//OtherBtnSection
const OtherBtnBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 10px 20px;

  margin-top: 11px;
  & button {
    border-radius: 5px;
  }
`;
//============================================

export default ShowManagerProfile;
