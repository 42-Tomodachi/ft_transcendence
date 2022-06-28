export interface IUserKey {
  id: number;
  nickname: string;
}

export interface IUser extends IUserKey {
  email: string;
  avatar: string;
}
export interface IUserAuth {
  secondAuth: boolean;
  accessToken?: string;
  isSigned: boolean;
}
export interface IUserProfile extends IUser, IWinLoseCount {}

export interface IRoomList {
  id: number;
  title: string;
  isPublic: boolean;
  playerCount: number;
  isLadder: boolean;
  isGameStart?: boolean;
}
export interface IWinLoseCount {
  winCount: number;
  loseCount: number;
  ladderWinCount: number;
  ladderLoseCount: number;
  ladderLevel: number;
}

export interface IUserWinLoseount extends IWinLoseCount {
  id: number;
}

export interface IGameRecord {
  isLadder: true;
  isWin: true;
  opponentNickname: string;
}
export interface IMessage {
  id: number;
  isBroadcast: boolean;
  from?: {
    id: number;
    nickname: string;
    profileImage: string;
  };
  message: string;
  fromUser: boolean;
  createdAt: string | number;
}

export type ButtonColorType = 'white' | 'white2' | 'main' | 'gradient';

export interface IUserList {
  id: number;
  nickname: string;
  isfriend: boolean;
  status: 'on' | 'off' | 'play';
}

export type ActiveMenuType = 'ALL' | 'FRIEND';

export const ON = 'on' as const;
export const OFF = 'off' as const;
export const PLAY = 'play' as const;

export const LOGIN = 'LOGIN' as const;
export const LOGOUT = 'LOGOUT' as const;
export const SET_NICKNAME = 'SET_NICKNAME' as const;
export const SECOND_AUTH = 'SECOND_AUTH' as const;

export type UserStatusType = 'LOGIN' | 'LOGOUT' | 'SET_NICKNAME' | 'SECOND_AUTH';
export type HandleUserType = 'LOGIN' | 'LOGOUT';

export const GAME = 'GAME' as const;
export const CHAT = 'CHAT' as const;
export const HOME = 'HOME' as const;

export type MenuType = 'GAME' | 'CHAT';

export const SHOW_PROFILE = 'SHOW_PROFILE' as const;
export const HANDLE_SECOND_AUTH = 'HANDLE_SECOND_AUTH' as const;
export const EDIT_NICKNAME = 'EDIT_NICKNAME' as const;
export const MAKE_GAME_ROOM = 'MAKE_GAME_ROOM' as const;
export const MAKE_CHAT_ROOM = 'MAKE_CHAT_ROOM' as const;
export const ENTER_GAME_ROOM = 'ENTER_GAME_ROOM' as const;
export const ENTER_CHAT_ROOM = 'ENTER_CHAT_ROOM' as const;
export const CHECK_SCORE = 'CHECK_SCORE' as const;
export const LOADING_LADDER_GAME = 'LOADING_LADDER_GAME' as const;
export const EDIT_CHAT_ROOM = 'EDIT_CHAT_ROOM' as const;
export const SHOW_OWNER_PROFILE = 'SHOW_OWNER_PROFILE' as const;
export const SHOW_MANAGER_PROFILE = 'SHOW_MANAGER_PROFILE' as const;
export const CHECK_LOGOUT = 'CHECK_LOGOUT' as const;
export const FIGHT_RES_MODAL = 'FIGHT_RES_MODAL' as const;
export const FIGHT_REQ_MODAL = 'FIGHT_REQ_MODAL' as const;

export type ModalType =
  | 'SHOW_PROFILE' // 프로필 정보 보기
  | 'HANDLE_SECOND_AUTH' // 이메일 인증
  | 'EDIT_NICKNAME' // 닉네임 수정
  | 'MAKE_GAME_ROOM' // 게임방 만들기
  | 'MAKE_CHAT_ROOM' // 채팅방 만들기
  | 'ENTER_GAME_ROOM' // 비밀 게임방 입장
  | 'ENTER_CHAT_ROOM' // 비밀 채팅방 입장
  | 'CHECK_SCORE' // 전적 확인
  | 'LOADING_LADDER_GAME' // 래더 게임 로딩
  | 'EDIT_CHAT_ROOM' // 채팅방 수정
  | 'SHOW_OWNER_PROFILE' // 채팅방 소유자 프로필
  | 'SHOW_MANAGER_PROFILE' // 채팅방 관리자 프로필
  | 'CHECK_LOGOUT' // 로그아웃 확인
  | 'FIGHT_RES_MODAL' // 1:1 대전 응답 모달
  | 'FIGHT_REQ_MODAL'; // 1:1 대전 요청 모달
