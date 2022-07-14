import React, { useState, useRef, useContext, useEffect } from 'react';
import styled from '@emotion/styled';
import Button from '../Button';
import Modal from '.';
import { AllContext } from '../../../store';
import { authAPI, usersAPI } from '../../../API';
import { LOGIN, SET_NICKNAME } from '../../../utils/interface';
import ProfileImage from '../ProfileImage';

const regex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]{2,8}$/;
const minNickName = 2;
const maxNickName = 8;

const EditMyProfile: React.FC = () => {
  const [nickName, setNickName] = useState<string>('');
  const [checkNickMsg, setCheckNickMsg] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const { user, setUser } = useContext(AllContext).userData; // TODO: 리렌더링 방지용 전역 관리
  const { jwt } = useContext(AllContext).jwtData; // TODO: JWT 유지를 위해 사용

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
  const onKeyEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key || e.keyCode;
    if (key == 'Enter' || key === 13) {
      // NOTE : 한글 중복 입력 제거
      if (e.nativeEvent.isComposing === false) onCheck();
    }
  };

  const onCheck = async () => {
    if (!regex.test(nickName)) {
      setCheckNickMsg(`2자 ~ 8자의 한글, 영어, 숫자로 작성해주세요`);
      setIsEnabled(false);
      return;
    }
    const res = await authAPI.checkNickname(nickName, jwt);

    if (res === null) {
      setCheckNickMsg(`다시 시도해주세요.`);
      setIsEnabled(false);
    } else if (res) {
      setCheckNickMsg(`중복된 닉네임입니다.`);
      setIsEnabled(false);
    } else {
      setCheckNickMsg(`사용 가능한 닉네임입니다.`);
      setIsEnabled(true);
    }
  };

  const onClickSubmit = () => {
    if (!isEnabled) {
      setCheckNickMsg(`닉네임 중복 체크를 먼저 해주세요.`);
    } else if (user) {
      const userId = user.userId;
      usersAPI.updateUserNickname(userId, nickName, user.jwt);
      setUser(LOGIN, { ...user, nickname: nickName });
    } else console.error('user 정보를 못불러 왔습니다.'); // TODO: null guard
  };

  return (
    <>
      {user && ( // TODO: 닉네임만 변경하는걸로 바꿔야함
        <Modal width={450} height={530} title={'내 프로필 수정'}>
          <MainBlock>
            <ProfileBlock>
              <ProfileImage src={user.avatar} size={150} />
            </ProfileBlock>
            <BtnBlock>
              <Button color="gradient" text="프로필 변경" width={120} height={30} />
            </BtnBlock>
            <Nick>
              <Nickguide>닉네임 :</Nickguide>
              <NickInput
                type="text"
                onChange={onEditNick}
                onKeyDown={onKeyEnter}
                defaultValue={nickName}
                spellCheck={false}
              />

              <Button color="white" text="중복체크" width={80} height={28} onClick={onCheck} />
              <DupMsg>{checkNickMsg}</DupMsg>
            </Nick>
            <BtnBlock>
              <Button
                color="gradient"
                text="닉네임 변경"
                width={120}
                height={30}
                onClick={onClickSubmit}
              />
            </BtnBlock>
          </MainBlock>
        </Modal>
      )}
    </>
  );
};

const MainBlock = styled.div`
  padding: 13px;
  margin-top: 50px;
  width: 100%;

  & button {
    border-radius: 5px;
  }
`;

const ProfileBlock = styled.div`
  height: 150px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BtnBlock = styled.div`
  margin-top: 20px;
`;

const Nick = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 70px;
  & Button {
    display: inline-block;
  }
`;

const Nickguide = styled.span`
  width: 59px;
  height: 21px;
  font-size: 18px;
`;

const NickInput = styled.input`
  display: inline;
  outline: none;
  border: none;
  border-bottom: 1px solid;
  width: 150px;
  height: 24px;
  margin: 1%;
  text-align: center;
`;

const DupMsg = styled.span`
  margin-top: 5px;
  display: block;
  color: ${props => props.theme.colors.red};
  font-size: 14px;
  height: 10px;
`;

export default EditMyProfile;
