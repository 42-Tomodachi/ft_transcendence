<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/42-Tomodachi/ft_transcendence">
    <img src="./frontend/src/assets/logo.png" alt="Logo" width="505" height="80">
  </a>

  <h3 align="center">Multiplayer Pong & Chat Web Site</h3>

  <p align="center">
    A final Project in 42
    <br />
    <br />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
    <br />
    <img src="https://img.shields.io/badge/Nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
    <img src="https://img.shields.io/badge/Postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
    <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=white" />
    <br />
    <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white" />
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" />

  </p>
</div>
<br />

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#signup">Signup</a></li>
        <li><a href="#2auth">2Auth</a></li>
        <li><a href="#chat">Chat</a></li>
        <li><a href="#game">Game</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#member">Member</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
<br />

## About The Project

---

<!-- 간단한 프로젝트 설명 -->
<!-- 구현 및 기술 스택 선정 이유 -->
<div align="center">
  <img src="./.github/asset/pong42_main.png" width="300px" height="300px"/>
</div>

pong 42는 Typescript 기반의 React, Nest를 사용해서 만든 채팅 / 핑퐁 사이트입니다.

### Signup / Login

- 최초 회원가입 단계

- 닉네임 / 프로필 등록 단계

- (2차인증 활성화시) 2차인증 단계

### Lobby

- 로비 구성

- 내 프로필 변경

- 유저 상태(로그인, 로그아웃, 게임중)

- 게임 초대받기 / 걸기 / 거부하기

- 친구 추가 / 삭제

- 특정 유저 차단하기 / 차단 해제

- 2차 인증 단계

### In Chat

- 일반 채팅 기능

- 권한 부여하기

- 프로필 변경 실시간 확인

- DM 보내기

- 방 뒤로가기

- (관리자) 차단, 강퇴 / 입장금지, 음소거

- (관리자) 방 주인한테 강퇴 / 입장금지

- (방주인) 방 제목 / 접근 방식 변경

### In Game

- 일반 / 장애물 / 스피드 모드

- (로비에서) 레더모드 매칭 되는 부분

- 관전 기능

<p align="right"><a href="#readme-top">back to top</a></p>

## Getting Started

---

<br/>

### Prerequisites

1. 본 프로젝트는 42 intra를 이용할 수 있는 42 cadet이어야 정상 이용이 가능하다.

2. 42API로 발급받은 UID, secret key, redirection URL을 사용해 각 컨테이너별 .env에서 해당 값들을 작성해줘야 한다

- Backend .env

  ```text
    # Ground Setup
    BACKSERVER_ADDR=  # IP
    BACKSERVER_PORT= # ex) 5500
    FRONTSERVER_PORT= # ex) 3000

    # 42 API Key
    42API_UID=
    42API_SECRET=

    # TypeORM configuration
    ## set values depends on config of Database
    TYPEORM_TYPE=
    TYPEORM_HOST=
    TYPEORM_PORT=
    TYPEORM_USERNAME=
    TYPEORM_PASSWORD=
    TYPEORM_DATABASE=

    # JWT strategy configuration
    JWT_SECRET=
    JWT_EXPIRESIN=

    # Email service configuration
    ## Following values will be used to send verification Emails.
    ## account used should be configured correctly on Host service (like Naver, Google...).
    EMAIL_HOST=
    EMAIL_FROM_USER_NAME=
    EMAIL_AUTH_EMAIL=
    EMAIL_AUTH_PASSWORD=

    # Timezone
    ## This value affects the timestamp of logs from NodeJs.
    TZ=Asia/Seoul
  ```

- Frontend .env

  ```text
    # This value should be IDENTICAL to the corresponding redirection address.
    REACT_APP_OAUTH_URL=
    # This value should be Address to Backend Server.
    REACT_APP_BACK_API=
  ```

- Database .env

  ```text
    # For Postgresql env
    POSTGRES_USER=
    POSTGRES_PASSWORD=
    POSTGRES_DB=
  ```

## Constraint

(평가 받기위해 우리가 걸어둔 제약조건(MVP))

### Frontend

### Backend

<p align="right"><a href="#readme-top">back to top</a></p>

<!-- Prject member -->

## Member

---

### Frontend

| [dhyeon]() | [junselee]() | [mosong](https://www.github.com/mike2ox)                               | [sgang]() |
| ---------- | ------------ | ---------------------------------------------------------------------- | --------- |
|            |              | ![mosong](https://avatars2.githubusercontent.com/u/22931103?s=460&v=4) |           |

<br />

### Backend

| [jihokim]() | [kankim]() | [seungyel]() |
| ----------- | ---------- | ------------ |
|             |            |              |

<p align="right"><a href="#readme-top">back to top</a></p>

## Resource & Reference

---

### Resource

- [Figma](https://www.figma.com/file/UjJCRaBS3Kc9o7jiX00Q7g/%ED%8A%B8%EC%84%BC?node-id=0%3A1)
- [ERDCloud](https://www.erdcloud.com/d/JZBPBnQaPY6zGt4Rr)

### Convention

- [Frontend Code Convention](./.github/FE_CODE_CONVENTION.md)
- [Backend Code Convention](./.github/BE_CODE_CONVENTION.md)
- [Git Convention](./.github/GIT_CONVENTION.md)

<!-- LICENSE -->

## License

---

MIT 라이센스 적용시키기

<p align="right"><a href="#readme-top">back to top</a></p>
