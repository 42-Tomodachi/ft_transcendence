import React, { useState, useRef } from 'react';
import Button from '../components/common/Button';
import styled from '@emotion/styled';
import axios from 'axios';

const DEFAULT_PROFILE =
  'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

const NicknamPage: React.FC = () => {
  const [nickImage, setNickImage] = useState<string>(DEFAULT_PROFILE);
  const [nickName, setNickName] = useState<string>('');
  const [dupNcikMsg, setDupNcikMsg] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const profileIamge = useRef<HTMLInputElement>(null);

  const onEditNick = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.dir(e.target.value);
    setDupNcikMsg('');
    setNickName(e.target.value);
  };
  const onFindImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const imgTarget = e.target.files[0];
      const fileReader = new FileReader();

      fileReader.readAsDataURL(imgTarget);
      fileReader.onload = () => setNickImage(fileReader.result as string);
    } else {
      setNickImage(DEFAULT_PROFILE);
    }
  };
  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Enter') onCheck();
  };
  // TODO: 전체 닉네임들을 다 탐색해야함(front or back)
  const onCheck = () => {
    //  const result = await axios.get(`http://localhost:4000/profile/`);
    // const userList = result.data;
    const resNickName = 'mike2ox';

    if (!nickName.length) {
      console.log('닉네임을 입력해');
      return;
    }

    if (nickName !== resNickName) {
      setDupNcikMsg(`사용 가능한 닉네임입니다.`);
      setIsEnabled(true);
    } else {
      setDupNcikMsg(`중복된 닉네임입니다.`);
      setIsEnabled(false);
    }
  };
  return (
    <NickTemplate>
      <NickForm>
        <NickGuide>프로필을 작성해주세요</NickGuide>
        <NickImageResult alt="profile" src={nickImage} />
        <NickImage htmlFor="profile">프로필 업로드</NickImage>
        <NickImageButton
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
            onKeyDown={onKeyPress}
            defaultValue={nickName}
          />
          <CheckDuplicate type="button" onClick={onCheck} defaultValue="중복 체크" />
          <DupMsg>{dupNcikMsg}</DupMsg>
        </Nick>
        <Button
          width={130}
          height={30}
          color="gradient"
          text="확인"
          onClick={() => {
            if (isEnabled) {
              console.dir(nickImage);
              console.dir(nickName);
            } else {
              alert('닉네임이 일치하지 않습니다');
            }
          }}
        />
      </NickForm>
    </NickTemplate>
  );
};
const NickTemplate = styled.div`
  display: flex;
  justify-content: center;
`;
const NickForm = styled.div`
  display: block;
  padding: 15px;
  width: 700px;
  height: 800px;
  margin-top: 120px;
  padding: 55px;
  border: 2px solid #c6b0eb;
  border-radius: 20px;
  justify-content: center;
`;

const NickGuide = styled.h2`
  width: 227px;
  height: 28px;

  font-weight: 700;
  font-size: 24px;

  color: #c6b0eb;
`;

const NickImage = styled.label`
  background: ${props => props.theme.colors['gradient']};
  width: 130px;
  height: 30px;
  color: white;
  border: none;
  border-radius: 10px;
  padding-left: 1.2em;
  line-height: 1.7em;
  cursor: pointer;
  margin: 0 auto;
  transition: all 0.2s ease-in-out;
  display: block;
  &:hover {
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.25);
  }
`;
const NickImageResult = styled.img`
  width: 300px;
  height: 300px;

  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #bbb;
  border-radius: 50%;
  outline: none;
  margin: 50px auto;
`;

const NickImageButton = styled.input`
  // -webkit-appearance: none;
  // -moz-appearance: none;
  display: none;
`;

const Nick = styled.div`
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  text-align: center;
  margin-top: 80px;
  color: #ff6363;
`;

const Nickguide = styled.span`
  width: 59px;
  height: 21px;

  font-weight: 400;
  font-size: 18px;

  color: #000000;
`;

const NickInput = styled.input`
  outline: none;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1.5px solid #000000;
  width: 256px;
  height: 30px;
  margin: 1%;
`;

const CheckDuplicate = styled.input`
  width: 113px;
  height: 32px;

  background: #ffffff;
  border: 1px solid #c6b0eb;
  border-radius: 5px;

  font-weight: 400;
  font-size: 18px;

  text-align: center;

  color: #000000;
`;

const DupMsg = styled.p`
  margin: 10px 0;
  color: ${props => props.theme.colors.red};
  font-style: normal;
  font-size: 14px;
  height: 14px;
`;

export default NicknamPage;
