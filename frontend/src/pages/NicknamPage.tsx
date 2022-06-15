import React, { useState, useRef } from 'react';
import Button from '../components/common/Button';
import styled from '@emotion/styled';
import axios from 'axios';

const DEFAULT_PROFILE =
  'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

const NicknamPage: React.FC = () => {
  const [nickImage, setNickImage] = useState(DEFAULT_PROFILE);
  const [nickName, setNcikName] = useState('');
  const profileIamge = useRef<HTMLInputElement>(null);

  const onEditNick = (e: any) => {
    // console.dir(e.target.value);
    setNcikName(e.target.value);
  };
  const onFindImage = (e: any) => {
    if (e.target.files.length) {
      const imgTarget = e.target.files[0];
      const fileReader = new FileReader();

      fileReader.readAsDataURL(imgTarget);
      fileReader.onload = (event: any) => {
        setNickImage(event.target.result);
      };
    } else {
      setNickImage(DEFAULT_PROFILE);
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
          <div>
            <span className="guide">닉네임 :</span>
            <input type="text" id="nickInput" onChange={onEditNick} value={nickName} />
            <input type="button" id="checkDuplicate" value="중복 체크" />
            <p>중복된 닉네임 입니다</p> {/* 중복 체크값에 따라 visibility:hidden <-> visible ?*/}
          </div>
        </Nick>
        <Button
          width={130}
          height={30}
          color="gradient"
          text="확인"
          onClick={() => {
            console.dir(profileIamge);
            console.dir(nickName);
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
  color: 'white';
  border: 'none';
  border-radius: 10px;
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
  margin: auto;
`;

const NickImageButton = styled.input`
  // -webkit-appearance: none;
  // -moz-appearance: none;
  display: none;
`;

const Nick = styled.div`
  .guide {
    width: 59px;
    height: 21px;

    font-weight: 400;
    font-size: 18px;

    color: #000000;
  }

  #nickInput {
    outline: none;
    border-top: none;
    border-left: none;
    border-right: none;
    border-bottom: 1.5px solid #000000;
    width: 256px;
    height: 30px;
    margin: 1%;
  }
  #checkDuplicate {
    width: 113px;
    height: 32px;

    background: #ffffff;
    border: 1px solid #c6b0eb;
    border-radius: 5px;

    font-weight: 400;
    font-size: 18px;

    text-align: center;

    color: #000000;
  }
  div {
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    text-align: center;

    color: #ff6363;
  }
`;

export default NicknamPage;
