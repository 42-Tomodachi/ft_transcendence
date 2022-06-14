import React, { useState, useRef } from 'react';
import Button from '../components/common/Button'
import styled from '@emotion/styled';

const DEFAULT_PROFILE = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

const NicknamPage: React.FC = () => {
  
	const [nickImage, setNickImage] = useState(DEFAULT_PROFILE);
  const onImageChange = (e: any) => {
    if (e.target.files.length) {
			const imgTarget = e.target.files[0];
			const fileReader = new FileReader();
			console.dir(imgTarget);
			fileReader.readAsDataURL(imgTarget);
			fileReader.onload = (event: any) =>{
				setNickImage(event.target.result);
				console.dir(event.target);
			}
		}
		else {
			setNickImage(DEFAULT_PROFILE);
		}
  }
  return (
    
    <NickTemplate>
      <NickForm>
        <NickGuide>프로필을 작성해주세요</NickGuide>
        <NickImage htmlFor='profile'>
          <NickImageResult 
          />
          <Button 
            width={130}
            height={30}
            color="gradient"
            text="이미지 업로드"
          />
        </NickImage>
        <Nick>
          <div>
            <span className="guide">닉네임 :</span>
            <input type="text" id="nickInput" />
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
            console.log("안녕하세요");
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
  border: 2px solid #C6B0EB;
  border-radius: 20px;
  justify-content: center;
`;

const NickGuide = styled.h2`
  width: 227px;
  height: 28px;

  font-weight: 700;
  font-size: 24px;

  color: #C6B0EB;
`;
const NickImage = styled.label`

`;
const NickImageResult = styled.div`
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

    background: #FFFFFF;
    border: 1px solid #C6B0EB;
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

    color: #FF6363;
  }
`;

export default NicknamPage;