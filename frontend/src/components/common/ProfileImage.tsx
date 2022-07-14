import React from 'react';
import styled from '@emotion/styled';
import defaultImage from '../../assets/default-image.png';

interface ProfileImageProps {
  src: string;
  size: number;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ src, size }) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = defaultImage;
  };

  return (
    <ProfileImageContainer size={size}>
      <ProfileImageImg src={src || defaultImage} alt="ProfileImage" onError={handleError} />
    </ProfileImageContainer>
  );
};

const ProfileImageContainer = styled.div<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;
  background-image: url(${defaultImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
`;

const ProfileImageImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export default ProfileImage;
