import React, { useContext } from 'react';
import styled from '@emotion/styled';
import LogoImg from '../../assets/logo-white.png';
import { MenuType, GAME, CHAT, HOME, CHECK_LOGOUT, EDIT_CHAT_ROOM } from '../../utils/interface';
import { AllContext } from '../../store';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../common/Button';
import { chatsAPI } from '../../API';

interface HeaderProps {
  type: 'HOME' | 'CHAT' | 'GAME';
}

const Header: React.FC<HeaderProps> = ({ type }) => {
  const { setModal } = useContext(AllContext).modalData;
  const { user } = useContext(AllContext).userData;
  const navigate = useNavigate();
  const { roomId } = useParams();

  const onClickMenu = (menu: MenuType | 'HOME') => {
    switch (menu) {
      case HOME:
        navigate('/');
        return;
      case GAME:
        navigate('/game');
        return;
      case CHAT:
        navigate('/chat');
        return;
      default:
        return;
    }
  };

  const onClickExitBtn = async () => {
    if (user && roomId) {
      await chatsAPI.leaveChatRoom(+roomId, user.userId, user.jwt);
      onClickMenu(CHAT);
    }
  };

  return (
    <HeaderContainer>
      <LogoWrap onClick={() => onClickMenu(HOME)}>
        <Logo src={LogoImg} alt="Home" />
      </LogoWrap>
      {
        {
          HOME: (
            <Menus>
              <Menu onClick={() => onClickMenu(GAME)}>GAME</Menu>
              <Menu onClick={() => onClickMenu(CHAT)}>CHAT</Menu>
              <Menu onClick={() => setModal(CHECK_LOGOUT)}>LOGOUT</Menu>
            </Menus>
          ),
          CHAT: (
            <Menus>
              {/* TODO : 나중에 role 받아와서 소유자만 버튼 표시되도록 해야함 */}
              <Button
                color="white"
                text="방 설정"
                width={140}
                height={50}
                onClick={() => setModal(EDIT_CHAT_ROOM)}
              />
              <Button
                color="white"
                text="방 나가기"
                width={140}
                height={50}
                onClick={onClickExitBtn}
              />
            </Menus>
          ),
          GAME: (
            <Menus>
              <Button color="white" text="방 나가기" width={140} height={50} />
            </Menus>
          ),
        }[type]
      }
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: space-between;
  align-items: end;
  padding: 15px 0;
  margin-bottom: 20px;
`;
const LogoWrap = styled.div`
  width: 300px;
`;
const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;

  cursor: pointer;
`;
const Menus = styled.nav`
  display: flex;
  & button {
    margin-left: 18px;
  }
`;
const Menu = styled.span`
  display: inline-block;
  width: 100px;
  color: white;
  font-size: 20px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  &:hover {
    color: ${({ theme }) => theme.colors.lightBlue};
  }
`;

export default Header;
