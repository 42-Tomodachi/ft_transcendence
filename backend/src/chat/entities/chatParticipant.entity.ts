import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/users.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRoom } from './chattingRoom.entity';

@Entity()
export class ChatParticipant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '[FK] 채팅방 id' })
  @Column()
  chattingRoomId: number;

  @ApiProperty({ description: '[FK] 채팅방 참여자의 유저 id' })
  @Column()
  userId: number;

  @ApiProperty({ description: '채팅방에서 유저의 역할' })
  @Column({ default: 'guest' })
  role: 'owner' | 'manager' | 'guest';

  @ApiProperty({ description: '강퇴 여부' })
  @Column({ default: false })
  isBanned: boolean;

  @ApiProperty({ description: '음소거 여부' })
  @Column({ default: false })
  isMuted: boolean;

  @ManyToOne(() => ChatRoom, (chattingRoom) => chattingRoom.chatParticipant, {
    onDelete: 'CASCADE',
  })
  chattingRoom: ChatRoom;

  @ManyToOne(() => User, (user) => user.chatParticipant)
  user: User;
}
