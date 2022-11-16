import axios from 'axios';
import { authAPI } from './auth';
import { usersAPI } from './users';
import { chatsAPI } from './chats';
import { gameAPI } from './game';
const url = process.env.REACT_APP_BACK_API;

export const instance = axios.create({
  baseURL: url,
});

export { authAPI, usersAPI, chatsAPI, gameAPI };
