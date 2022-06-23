import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/users.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class GameRecord extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '첫번째 플래이어의 유저 id' })
  @Column()
  playerOneId: number;

  @ApiProperty({ description: '두번째 플레이어의 유저 id' })
  @Column()
  playerTwoId: number;

  @ApiProperty({ description: '첫번째 플레이어의 점수' })
  @Column()
  playerOneScore: number;

  @ApiProperty({ description: '두번째 플레이어의 점수' })
  @Column()
  playerTwoScore: number;

  @ApiProperty({ description: '승자 id' })
  @Column()
  winnerId: number;

  @ApiProperty({ description: '래더게임 여부' })
  @Column()
  isLadder: string;

  @ManyToOne(() => User, (user) => user.playerOne)
  playerOne: User;

  @ManyToOne(() => User, (user) => user.playerTwo)
  playerTwo: User;
}
