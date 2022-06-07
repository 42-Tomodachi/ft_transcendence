import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChatParticipant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '채팅방 id' })
  @Column()
  chattingRoomId: number;

  @ApiProperty({ description: '채팅방 참여자의 유저 id' })
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
}
