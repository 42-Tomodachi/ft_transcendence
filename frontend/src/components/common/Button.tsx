import React from 'react';
import styled from '@emotion/styled';

interface ButtonProps {
  color: string;
  text: string;
  width: number;
  height: number;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ color, text, width, height, onClick }) => {
  return (
    <ButtonContainer
      width={width}
      height={height}
      gradient={color === 'gradient' ? true : false}
      color={color}
      onClick={onClick}
    >
      {text}
    </ButtonContainer>
  );
};

interface ButtonContainerProps {
  width: number;
  height: number;
  gradient: boolean;
  color: string;
}

const ButtonContainer = styled.button<ButtonContainerProps>`
  ${({ color, gradient, theme }) =>
    gradient ? `background: ${theme.colors[color]};` : `background-color: ${theme.colors[color]};`}
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  color: ${({ color }) => (color === 'white' ? 'black' : 'white')};
  border: ${({ color, theme }) => (color === 'white' ? `1px solid ${theme.colors.main}` : 'none')};
  border-radius: 10px;
  cursor: pointer;
  margin: 0 auto;
  display: block;
  transition: all 0.2s ease-in-out;

  &:hover {
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.25);
  }
`;

export default Button;
