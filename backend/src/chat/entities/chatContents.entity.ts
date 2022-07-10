import { ApiProperty } from '@nestjs/swagger';
import { ChatContentDto, ChatRoomUserDto } from 'src/chat/dto/chat.dto';
import { User } from 'src/users/entities/users.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateChatContentDto } from '../dto/chat.dto';
import { ChatRoom } from './chatRoom.entity';

@Entity()
export class ChatContents extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '[FK] 채팅방 id' })
  @Column()
  chatRoomId: number;

  @ApiProperty({ description: '[FK] 메세지 보낸 유저 id' })
  @Column({ nullable: true })
  userId: number | null;

  @ApiProperty({ description: '메세지 내용' })
  @Column()
  content: string;

  @ApiProperty({ description: '공지 메세지 여부' })
  @Column({ default: false })
  isNotice: boolean;

  @ApiProperty({ description: '메세지 보낸 시간' })
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdTime: Date;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatContents, {
    onDelete: 'CASCADE',
  })
  chatRoom: ChatRoom;

  @ManyToOne(() => User, (user) => user.sender)
  user: User;

  toChatContentDto(roomId: number, userId: number): ChatContentDto {
    const chatContentDto = new ChatContentDto();
    chatContentDto.isBroadcast = this.isNotice;
    if (!this.isNotice) {
      const chatRoomUserDto = new ChatRoomUserDto();
      chatRoomUserDto.userId = this.user.id;
      chatRoomUserDto.nickname = this.user.nickname;
      chatRoomUserDto.role = this.user.chatParticipant.find(
        (person) => person.chatRoomId === roomId,
      ).role;

      chatContentDto.from = { ...chatRoomUserDto, avatar: this.user.avatar };
    }
    chatContentDto.message = this.content;
    chatContentDto.fromUser = this.userId === userId ? true : false;
    chatContentDto.createdTime = this.createdTime.toLocaleTimeString();

    return chatContentDto;
  }
}
