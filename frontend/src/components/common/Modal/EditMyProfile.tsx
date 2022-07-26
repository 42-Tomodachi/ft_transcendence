import React, { useState, useRef, useContext, useEffect } from 'react';
import styled from '@emotion/styled';
import Button from '../Button';
import Modal from '.';
import { AllContext } from '../../../store';
import { authAPI, usersAPI } from '../../../API';
import { LOGIN, SET_NICKNAME } from '../../../utils/interface';
import ProfileImage from '../ProfileImage';
import imageCompression from 'browser-image-compression';
import DefaultProfile from '../../../assets/default-image.png';

const regex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]{2,8}$/;
const minNickName = 2;
const maxNickName = 8;

const EditMyProfile: React.FC = () => {
  const [nickName, setNickName] = useState<string>('');
  const [checkNickMsg, setCheckNickMsg] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const { user, setUser } = useContext(AllContext).userData; // TODO: 리렌더링 방지용 전역 관리
  const { setModal } = useContext(AllContext).modalData;
  const { jwt } = useContext(AllContext).jwtData; // TODO: JWT 유지를 위해 사용
  const profileIamge = useRef<HTMLInputElement>(null);
  const [profileImg, setProfileImg] = useState<string>(DefaultProfile);
  const [convertImg, setConvertImg] = useState<File | string>('');

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

  const onFindImage = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files?.length) {
      const imgTarget = e.target.files[0];
      const fileReader = new FileReader();
      const compressImgResult = await imageCompression(imgTarget, {
        maxWidthOrHeight: 800,
      });

      if (compressImgResult !== undefined) {
        const convertResult = new File([compressImgResult], imgTarget.name, {
          type: imgTarget.type,
          lastModified: imgTarget.lastModified,
        });
        setConvertImg(convertResult);
        fileReader.readAsDataURL(convertResult);
        fileReader.onload = () => setProfileImg(fileReader.result as string);
      }
    }
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
    } else if (res.isDuplicate) {
      if (user && user.nickname === nickName) setCheckNickMsg(`기존 닉네임입니다.`);
      else setCheckNickMsg(`중복된 닉네임입니다.`);
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
      const formData = new FormData();
      const userId = user.userId;

      if (convertImg) {
        formData.append('image', convertImg);
        usersAPI.uploadAvatarImg(userId, formData, user.jwt);
        setUser(LOGIN, { ...user, avatar: profileImg });
      }
      usersAPI.updateUserNickname(userId, nickName, user.jwt);
      setUser(LOGIN, { ...user, nickname: nickName });
      setModal(null);
    } else console.error('user 정보를 못불러 왔습니다.');
  };

  useEffect(() => {
    if (user) {
      setProfileImg(user.avatar);
    }
  }, []);

  return (
    <>
      {user && (
        <Modal width={450} height={530} title={'내 프로필 수정'}>
          <MainBlock>
            <ProfileBlock>
              <ProfileImage src={profileImg} size={150} />
            </ProfileBlock>
            <BtnBlock>
              <ProfileImgLabel htmlFor="profile">프로필 변경</ProfileImgLabel>
            </BtnBlock>
            {/* TODO: 프로필 변경만 파일 브라우저가 열리지 않음 */}
            <ProfileImgButton type="file" id="profile" ref={profileIamge} onChange={onFindImage} />
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
                text="확인"
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

const ProfileImgLabel = styled.label`
  text-align: center;
  background: ${props => props.theme.colors.gradient};
  width: 120px;
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

const ProfileImgButton = styled.input`
  display: none;
`;
export default EditMyProfile;
