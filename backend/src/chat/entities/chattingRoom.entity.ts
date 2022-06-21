import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatParticipant } from './chatParticipant.entity';

@Entity()
export class ChattingRoom extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '채팅방 제목' })
  @Column()
  title: string;

  @ApiProperty({ description: '채팅방 비밀번호' })
  @Column({ nullable: true })
  password: string;

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
}
