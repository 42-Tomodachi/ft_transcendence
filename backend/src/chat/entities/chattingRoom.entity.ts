import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRoomDataDto, ChatRoomDto as ChatRoomDto } from '../dto/chat.dto';
import { ChatContents } from './chatContents.entity';
import { ChatParticipant } from './chatParticipant.entity';

@Entity()
export class ChatRoom extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '채팅방 제목' })
  @Column()
  title: string;

  @ApiProperty({ description: '채팅방 비밀번호' })
  @Column({ nullable: true })
  password: string | null;

  @ApiProperty({ description: '채팅방 소유자 userId' })
  @Column()
  ownerId: number;

  @ApiProperty({ description: 'dm방인지 여부' })
  @Column({ default: false })
  isDm: boolean;

  @OneToMany(
    () => ChatParticipant,
    (chatParticipant) => chatParticipant.chattingRoom,
  )
  chatParticipant: ChatParticipant[];

  @OneToMany(() => ChatContents, (chatContents) => chatContents.chattingRoom)
  chatContents: ChatContents[];

  toChatRoomDto(): ChatRoomDto {
    if (this.chatParticipant === undefined) {
      throw Error('chatParticipant join required to chattingRoom');
    }

    const chattingRoomsDto = new ChatRoomDto();
    chattingRoomsDto.id = this.id;
    chattingRoomsDto.title = this.title;
    chattingRoomsDto.isPublic = this.password ? true : false;
    chattingRoomsDto.ownerId = this.ownerId;
    chattingRoomsDto.numberOfParticipants = this.chatParticipant.length;
    chattingRoomsDto.isDm = this.isDm;

    return chattingRoomsDto;
  }

  toChatRoomDataDto(): ChatRoomDataDto {
    const chatRoomDataDto = new ChatRoomDataDto();
    chatRoomDataDto.id = this.id;
    chatRoomDataDto.title = this.title;
    chatRoomDataDto.ownerId = this.ownerId;

    return chatRoomDataDto;
  }
}
