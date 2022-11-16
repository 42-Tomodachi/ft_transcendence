import React, { useContext } from 'react';
import styled from '@emotion/styled';
import { AllContext } from '../../store';
import {
  IGetUser,
  PLAY,
  ON,
  OFF,
  SHOW_PROFILE,
  ActiveMenuType,
  SHOW_OWNER_PROFILE,
  SHOW_MANAGER_PROFILE,
  UserRole,
} from '../../utils/interface';

interface UserItemProps {
  targetUser: IGetUser;
  loginUserRole?: UserRole;
  menuType: ActiveMenuType;
  roomId?: string;
  isDm?: boolean;
}

const UserItem: React.FC<UserItemProps> = ({
  targetUser,
  loginUserRole,
  menuType,
  roomId,
  isDm,
}) => {
  const { setModal } = useContext(AllContext).modalData;
  const { setTargetId } = useContext(AllContext).targetItem;

  return (
    <>
      <UserItemContainer
        status={targetUser.status}
        onClick={() => {
          setTargetId(targetUser.userId);
          if (menuType !== 'ALL' && roomId) {
            if (loginUserRole === 'owner' && !isDm && menuType !== 'FRIEND') {
              setModal(SHOW_OWNER_PROFILE, targetUser.userId, +roomId);
            } else if (loginUserRole === 'manager' && !isDm && menuType !== 'FRIEND') {
              setModal(SHOW_MANAGER_PROFILE, targetUser.userId, +roomId);
            } else {
              setModal(SHOW_PROFILE, targetUser.userId, +roomId);
            }
          } else setModal(SHOW_PROFILE, targetUser.userId);
        }}
      >
        {targetUser.nickname}
      </UserItemContainer>
    </>
  );
};

const UserItemContainer = styled.li<{ status: string }>`
  ::before {
    content: '';
    position: absolute;
    top: 15px;
    left: 15px;
    border-radius: 50%;
    background-color: ${props => props.theme.colors.green};
    width: 8px;
    height: 8px;
    ${props => {
      switch (props.status) {
        case PLAY:
          return `background: ${props.theme.colors.red};`;
        case ON:
          return `background: ${props.theme.colors.green};`;
        default:
          return `background: ${props.theme.colors.deepGrey};`;
      }
    }}
  }
  cursor: pointer;
  position: relative;
  border: 1px solid ${props => props.theme.colors.grey};
  display: flex;
  justify-content: left;
  align-items: center;
  width: 250px;
  height: 35px;
  line-height: 30px;
  margin-top: 10px;
  padding-left: 30px;
  border-radius: 10px;
  background-color: transparent;
  font-style: normal;
  font-size: 14px;
  ${props => props.status === OFF && `color: ${props.theme.colors.deepGrey};`}
  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.main};
  }
`;

export default UserItem;
