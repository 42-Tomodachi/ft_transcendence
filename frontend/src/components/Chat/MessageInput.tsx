import React, { useState } from 'react';
import styled from '@emotion/styled';
import Button from '../common/Button';
import { IMessage } from '../../utils/interface';

interface MessageItemProps {
  setMessages: (messages: IMessage[]) => void;
  messages: IMessage[];
}

const MessageInput: React.FC<MessageItemProps> = ({ setMessages, messages }) => {
  const [input, setInput] = useState<string>('');

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const sendMessage = () => {
    if (input.trim().length > 0) {
      const newMessage: IMessage = {
        id: messages.length + 1,
        from: {
          id: 1,
          nickname: 'test',
          profileImage: 'https://placehold.jp/150x150.png',
        },
        message: input,
        isBroadcast: false,
        fromUser: true,
        createdAt: new Date().toISOString(),
      };
      setMessages([...messages, newMessage]);
    }
    setInput('');
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <ChatInputArea>
      <ChatInputWrap>
        <ChatInput type="text" onChange={onChangeInput} value={input} onKeyPress={handleEnter} />
      </ChatInputWrap>
      <Button color="main" width={100} height={50} text="전송" onClick={sendMessage} />
    </ChatInputArea>
  );
};

const ChatInputArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  & button {
    &:disabled {
      background-color: ${({ theme }) => theme.colors.grey};
    }
  }
`;
const ChatInputWrap = styled.div`
  width: 100%;
  height: 50px;
  border: 1px solid ${({ theme }) => theme.colors.main};
  border-radius: 50px;
  margin-right: 10px;
`;
const ChatInput = styled.input`
  display: block;
  width: 100%;
  height: 50px;
  border: none;
  outline: none;
  font-size: 14px;
  background-color: transparent;
  padding: 11px 20px;
`;

export default MessageInput;
