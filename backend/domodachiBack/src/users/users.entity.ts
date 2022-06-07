import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '닉네임' })
  @Column({ unique: true })
  nickname: string;

  @ApiProperty({ description: '아바타' })
  @Column()
  avatar: string;

  @ApiProperty({ description: '이메일' })
  @Column()
  email: string;

  @ApiProperty({ description: '2차 인증 여부' })
  @Column({ default: false })
  isSecondAuthOn: boolean;

  @ApiProperty({ description: '이메일로 보낸 코드와 비교할2차 인증 코드' })
  @Column({ nullable: true, default: null })
  secondAuth: boolean;

  @ApiProperty({ description: '이메일로 보낸 코드와 비교할2차 인증 코드' })
  @Column({ nullable: true, default: null })
  secondAuthCode: number;

  @ApiProperty({ description: '승리 횟수' })
  @Column({ default: 0 })
  winCount: number;

  @ApiProperty({ description: '패배 횟수' })
  @Column({ default: 0 })
  loseCount: number;

  @ApiProperty({ description: '래더 승리 횟수' })
  @Column({ default: 0 })
  ladderWinCount: number;

  @ApiProperty({ description: '래더 패배 횟수' })
  @Column({ default: 0 })
  ladderloseCount: number;

  // 친구, 승패, 레더레벨, 업적, 모든 경기 기록
}
