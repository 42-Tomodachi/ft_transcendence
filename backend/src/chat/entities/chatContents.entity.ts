import { ApiProperty } from '@nestjs/swagger';
import { ChatRoomUserDto } from 'src/users/dto/users.dto';
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
import { ChatRoom } from './chattingRoom.entity';

@Entity()
export class ChatContents extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '[FK] 채팅방 id' })
  @Column()
  chattingRoomId: number;

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

  @ManyToOne(() => ChatRoom, (chattingRoom) => chattingRoom.chatContents, {
    onDelete: 'CASCADE',
  })
  chattingRoom: ChatRoom;

  @ManyToOne(() => User, (user) => user.sender)
  user: User;

  toCreateChatContentDto(roomId: number, userId: number): CreateChatContentDto {
    const createChatContentDto = new CreateChatContentDto();
    createChatContentDto.isBroadcast = this.isNotice;
    if (!this.isNotice) {
      const chatRoomUserDto = new ChatRoomUserDto();
      chatRoomUserDto.id = this.user.id;
      chatRoomUserDto.nickname = this.user.nickname;
      chatRoomUserDto.role = this.user.chatParticipant.find(
        (person) => person.chattingRoomId === roomId,
      ).role;

      createChatContentDto.from = chatRoomUserDto;
    }
    createChatContentDto.message = this.content;
    createChatContentDto.fromUser = this.userId === userId ? true : false;
    createChatContentDto.createdTime = this.createdTime;

    return createChatContentDto;
  }
}
