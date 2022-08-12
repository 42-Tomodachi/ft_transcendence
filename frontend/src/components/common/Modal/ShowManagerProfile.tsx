import React, { useContext, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Button from '../Button';
import Modal from '.';
import { AllContext } from '../../../store';
import { CHECK_SCORE, IUserData } from '../../../utils/interface';
import { useNavigate } from 'react-router-dom';
import { chatsAPI, usersAPI } from '../../../API';
import defaultProfile from '../../../assets/default-image.png';
import ProfileImage from '../ProfileImage';

const ShowManagerProfile: React.FC<{ roomId: number; userId: number }> = ({ roomId, userId }) => {
  const { setModal } = useContext(AllContext).modalData;
  const [target, setTarget] = useState<IUserData | null>(null);
  const { user } = useContext(AllContext).userData;
  const navigate = useNavigate();

  useEffect(() => {
    const getUserInfo = async () => {
      if (user && user.jwt) {
        const data = await usersAPI.getUserProfile(user.userId, userId, user.jwt);
        if (data) {
          if (data.avatar) setTarget(data);
          else setTarget({ ...data, avatar: defaultProfile });
        }
      }
    };
    getUserInfo();
  }, []);

  const onClickFriend = async () => {
    if (user && user.jwt && target) {
      if (target.isFriend === false) {
        await usersAPI.makeFriend(user.userId, target.userId, user.jwt);
      } else {
        await usersAPI.deleteFriend(user.userId, target.userId, user.jwt);
      }
      setTarget({
        ...target,
        isFriend: !target.isFriend,
      });
      setModal(null);
    }
  };

  const onClickBlock = async () => {
    if (user && user.jwt && target) {
      const res = await usersAPI.toggleBlockUser(user.userId, target.userId, user.jwt);
      setTarget({
        ...target,
        isFriend: false,
        isBlocked: !target.isBlocked,
      });
      if (res) {
        setModal(null);
      }
    }
    console.log('block');
  };

  const onClickBan = async () => {
    if (target && user) {
      const res = await chatsAPI.banUserInChatRoom(roomId, user.userId, target.userId, user.jwt);
      console.log('ban');
      if (res) {
        setModal(null);
      }
    }
  };
  const onToggleMute = async () => {
    if (target && user) {
      const res = await chatsAPI.setUpMuteUser(roomId, target.userId, user.jwt);
      console.log('Toggle Mute', res);
      if (res) {
        setModal(null);
      }
    }
  };
  const onApplyGame = async () => {
    console.log('send msg');
  };
  const onSendDm = async () => {
    if (user && target) {
      const res = await chatsAPI.enterDmRoom(user.userId, target.userId, user.jwt);

      if (res && res.roomId) {
        setModal(null);
        navigate(`/chatroom/${res.roomId}`);
      }
    }
  };

  return (
    <>
      {target && (
        <Modal width={500} height={target.isBlocked === false ? 550 : 450} title={'프로필 보기'}>
          <MainBlock>
            <ProfileBlock>
              <PictureBlock>
                <ProfileImage src={target.avatar} size={100} />
              </PictureBlock>
              <UserInfo>
                <UserName>{target.nickname}</UserName>
                <UserLevel>lv.{target.ladderLevel}</UserLevel>
              </UserInfo>
            </ProfileBlock>

            <RecordText>전적/래더전적</RecordText>

            <RecordBlock>
              <Record>
                {target.winCount}승 {target.loseCount}패/{target.ladderWinCount}승{' '}
                {target.ladderLoseCount}패
              </Record>
              <RecordBtn>
                <Button
                  color="white"
                  text="전적 기록"
                  width={97}
                  height={30}
                  onClick={() => {
                    setModal(CHECK_SCORE, target.userId);
                  }}
                />
              </RecordBtn>
            </RecordBlock>
            {target.isBlocked === false ? (
              <OtherBtnBlock>
                <Button
                  color="gradient"
                  text={target.isFriend ? '친구 해제' : '친구 추가'}
                  width={200}
                  height={40}
                  onClick={onClickFriend}
                  disabled={target.isBlocked ? true : false}
                />
                <Button
                  color="gradient"
                  text="게임 신청"
                  width={200}
                  height={40}
                  onClick={onApplyGame}
                />
                <Button
                  color="gradient"
                  text="DM 보내기"
                  width={200}
                  height={40}
                  onClick={onSendDm}
                />
                <Button
                  color="white2"
                  text={target.isBlocked ? '차단해제' : '차단하기'}
                  width={200}
                  height={40}
                  onClick={onClickBlock}
                />
                <Button color="white2" text="밴" width={200} height={40} onClick={onClickBan} />
                <Button color="white2" text="뮤트" width={200} height={40} onClick={onToggleMute} />
              </OtherBtnBlock>
            ) : (
              <BanBtnBlock>
                <Button
                  color="white2"
                  text={target.isBlocked ? '차단해제' : '차단하기'}
                  width={415}
                  height={40}
                  onClick={onClickBlock}
                />
              </BanBtnBlock>
            )}
          </MainBlock>
        </Modal>
      )}
    </>
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
const BanBtnBlock = styled.div`
  margin-top: 11px;
  & button {
    border-radius: 5px;
  }
`;
//============================================

export default ShowManagerProfile;
