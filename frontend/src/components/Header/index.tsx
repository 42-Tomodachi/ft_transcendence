import React, { useContext } from 'react';
import styled from '@emotion/styled';
import LogoImg from '../../assets/logo-white.png';
import { MenuType, GAME, CHAT, LOGOUT, CHECK_LOGOUT } from '../../utils/interface';
import { AllContext } from '../../store';

interface HeaderProps {
  onClickMenu: (menuType: MenuType) => void;
}

const Header: React.FC<HeaderProps> = ({ onClickMenu }) => {
  const { setModal } = useContext(AllContext).modalData;

  return (
    <HeaderContainer>
      <LogoWrap onClick={() => onClickMenu(GAME)}>
        <Logo src={LogoImg} alt="Home" />
      </LogoWrap>
      <Menus>
        <Menu onClick={() => onClickMenu(GAME)}>GAME</Menu>
        <Menu onClick={() => onClickMenu(CHAT)}>CHAT</Menu>
        <Menu onClick={() => setModal(CHECK_LOGOUT)}>LOGOUT</Menu>
      </Menus>
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
