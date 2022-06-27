import { ApiProperty } from '@nestjs/swagger';
import { IsSignedUpDto } from 'src/auth/dto/auth.dto';
import { ChatContents } from 'src/chat/entities/chatContents.entity';
import { ChatParticipant } from 'src/chat/entities/chatParticipant.entity';
import { GameRecord } from 'src/users/entities/gameRecord.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfileDto, WinLoseCountDto } from '../dto/users.dto';
import { BlockedUser } from './blockedUser.entity';
import { Follow } from './follow.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '닉네임' })
  @Column({ nullable: true, default: null })
  nickname: string | null;

  @ApiProperty({ description: '아바타' })
  @Column({ nullable: true, default: null })
  avatar: string | null;

  @ApiProperty({ description: '42 이메일' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: '2차 인증 여부' })
  @Column({ default: false })
  isSecondAuthOn: boolean;

  @ApiProperty({ description: '2차 인증 이메일' })
  @Column({ nullable: true, default: null })
  secondAuthEmail: string | null;

  @ApiProperty({ description: '이메일로 보낸 코드와 비교할 2차 인증 코드' })
  @Column({ nullable: true, default: null })
  secondAuthCode: number | null;

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
  ladderLoseCount: number;

  // todo: 실시간으로 유저의 상태를 나타내지 않기로 함. 유저목록 갱신할 때 마다 api 호출 해야 하는데 그때 사용할 컬럼
  @ApiProperty({ description: '유저 상태 inactive | active | inGame' })
  @Column({ default: 'inactive' })
  userStatus: 'inactive' | 'active' | 'inGame';

  @OneToMany(() => Follow, (follow) => follow.follower)
  follower: Follow[];

  @OneToMany(() => Follow, (follow) => follow.follow)
  follow: Follow[];

  @OneToMany(() => BlockedUser, (blockedUser) => blockedUser.blocker)
  blocker: BlockedUser[];

  @OneToMany(() => BlockedUser, (blockedUser) => blockedUser.blocked)
  blocked: BlockedUser[];

  @OneToMany(() => GameRecord, (gameRecord) => gameRecord.playerOne)
  playerOne: GameRecord[];

  @OneToMany(() => GameRecord, (gameRecord) => gameRecord.playerTwo)
  playerTwo: GameRecord[];

  @OneToMany(() => ChatContents, (chatContents) => chatContents.user)
  sender: ChatContents[];

  @OneToMany(() => ChatParticipant, (chatParticipant) => chatParticipant.user)
  chatParticipant: ChatParticipant[];

  // 친구, 레더레벨, 업적, 모든 경기 기록

  getLadderLevel(): number {
    return Math.floor(
      (this.ladderWinCount * 3 + this.ladderLoseCount * 1) / 5 + 1,
    );
  }

  toUserProfileDto() {
    const userProfileDto = new UserProfileDto();
    userProfileDto.id = this.id;
    userProfileDto.nickname = this.nickname;
    userProfileDto.avatar = this.avatar;
    userProfileDto.email = this.email;
    userProfileDto.winCount = this.winCount;
    userProfileDto.loseCount = this.loseCount;
    userProfileDto.ladderWinCount = this.ladderWinCount;
    userProfileDto.ladderLoseCount = this.ladderLoseCount;
    userProfileDto.ladderLevel = this.getLadderLevel();

    return userProfileDto;
  }

  toWinLoseCount(): WinLoseCountDto {
    const winLoseCountDto = new WinLoseCountDto();
    winLoseCountDto.id = this.id;
    winLoseCountDto.winCount = this.winCount;
    winLoseCountDto.loseCount = this.loseCount;
    winLoseCountDto.ladderLoseCount = this.ladderLoseCount;
    winLoseCountDto.ladderWinCount = this.ladderWinCount;
    winLoseCountDto.ladderLevel = this.getLadderLevel();

    return winLoseCountDto;
  }
}
