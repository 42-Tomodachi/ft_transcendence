import React, { useState, useRef, useContext } from 'react';
// import axios from 'axios';
import Button from '../components/common/Button';
import styled from '@emotion/styled';
import { AllContext } from '../store';
import { LOGIN } from '../utils/interface';

// TODO : 최초 42api 토큰 요청시 성공하면 인트라 사진도 갖고오도록 할 예정?
const DEFAULT_PROFILE =
  'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

const regex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]{2,8}$/;
const minNickName = 2;
const maxNickName = 8;

const NicknamePage: React.FC = () => {
  const [profileImg, setProfileImg] = useState<string>(DEFAULT_PROFILE);
  const [nickName, setNickName] = useState<string>('');
  const [checkNickMsg, setCheckNickMsg] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const profileIamge = useRef<HTMLInputElement>(null);
  const { setUserStatus } = useContext(AllContext).userStatus;

  const onEditNick = (e: React.ChangeEvent<HTMLInputElement>) => {
    //  NOTE : 정규식 적용
    const inputNickValue = e.target.value;

    if (!regex.test(inputNickValue)) {
      if (inputNickValue.length >= minNickName && inputNickValue.length <= maxNickName)
        setCheckNickMsg('한글, 영어, 숫자로만 작성해주세요');
      else setCheckNickMsg(`최소 2자, 최대 8자로 작성해주세요`);
    } else setCheckNickMsg('');
    setIsEnabled(false);
    setNickName(inputNickValue);
  };
  const onFindImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const imgTarget = e.target.files[0];
      const fileReader = new FileReader();

      fileReader.readAsDataURL(imgTarget);
      fileReader.onload = () => setProfileImg(fileReader.result as string);
    }
  };
  const onKeyEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key || e.keyCode;
    if (key == 'Enter' || key === 13) {
      // NOTE : 한글 중복 입력 제거
      if (e.nativeEvent.isComposing === false) onCheck();
    }
  };
  const checkNickName = (resNickName: string) => {
    if (nickName === resNickName) {
      setCheckNickMsg(`중복된 닉네임입니다.`);
      setIsEnabled(false);
      return false;
    }
    return true;
  };

  // TODO: 전체 닉네임들을 다 탐색해야함(front or back)
  const onCheck = () => {
    // console.log('한글 중복 check용 log');
    //  const result = await axios.get(`http://localhost:4000/profile/`);
    // const userList = result.data;

    const resNickName = 'mike2ox';
    if (checkNickName(resNickName)) {
      setCheckNickMsg(`사용 가능한 닉네임입니다.`);
      setIsEnabled(true);
    }
  };

  const onClickSubmit = () => {
    if (!isEnabled) {
      setCheckNickMsg(`닉네임 중복 체크를 먼저 해주세요.`);
    } else {
      // TODO : 서버에 전송하기
      setUserStatus(LOGIN);
    }
  };
  return (
    <NickTemplate>
      <NickForm>
        <NickGuide>프로필을 작성해주세요</NickGuide>
        <ProfileDivResult>
          <ProfileImgResult alt="profile" src={profileImg} />
        </ProfileDivResult>
        <ProfileImgLabel htmlFor="profile">프로필 업로드</ProfileImgLabel>
        <ProfileImgButton
          type="file"
          accept="image/*"
          name="profile"
          id="profile"
          ref={profileIamge}
          onChange={onFindImage}
        />
        <Nick>
          <Nickguide>닉네임 :</Nickguide>
          <NickInput
            type="text"
            onChange={onEditNick}
            onKeyDown={onKeyEnter}
            defaultValue={nickName}
            required
          />
          <CheckDuplicate onClick={onCheck}>중복 체크</CheckDuplicate>
          <DupMsg>{checkNickMsg}</DupMsg>
        </Nick>
        <Button width={130} height={30} color="gradient" text="확인" onClick={onClickSubmit} />
      </NickForm>
    </NickTemplate>
  );
};

const NickTemplate = styled.div`
  height: 100vh;
  overflow: auto;
`;

const NickForm = styled.div`
  width: 700px;

  padding: 55px;
  margin: 50px auto 20px;
  border: 2px solid ${props => props.theme.colors.main};
  border-radius: 20px;
  text-align: center;
`;

const NickGuide = styled.h2`
  height: 28px;

  font-weight: 700;
  font-size: 24px;
  text-align: left;

  color: ${props => props.theme.colors.main};
`;

const ProfileImgLabel = styled.label`
  background: ${props => props.theme.colors.gradient};
  width: 130px;
  height: 30px;
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 10px;
  line-height: 28px;
  cursor: pointer;
  margin: 0 auto;
  transition: all 0.2s ease-in-out;
  display: block;
  &:hover {
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.25);
  }
`;

const ProfileDivResult = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 50px auto;
`;

const ProfileImgResult = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfileImgButton = styled.input`
  display: none;
`;

const Nick = styled.div`
  text-align: center;
  margin-top: 80px;
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
  border-bottom: 1.5px solid ${props => props.theme.colors.gradient};
  width: 256px;
  height: 30px;
  margin: 1%;
  outline: none;
`;

const CheckDuplicate = styled.button`
  width: 113px;
  height: 32px;
  background: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.main};
  border-radius: 5px;
  font-size: 18px;

  text-align: center;
  cursor: pointer;
  color: ${props => props.theme.colors.gradient};
`;

const DupMsg = styled.span`
  margin: 10px 0;
  display: block;
  color: ${props => props.theme.colors.red};
  font-size: 14px;
  height: 40px;
`;

export default NicknamePage;
