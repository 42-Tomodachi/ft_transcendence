import { ApiProperty, PickType } from '@nestjs/swagger';

export class GameRecordDto {
  @ApiProperty({ description: '래더게임 여부' })
  isLadder: boolean;

  @ApiProperty({ description: '승리 여부' })
  isWin: boolean;

  @ApiProperty({ description: '상대 닉네임' })
  opponentNickname: string;
}

export class GameRecordSaveDto extends PickType(GameRecordDto, ['isLadder']) {
  @ApiProperty({ description: '[FK] 첫번째 플레이어의 유저 id' })
  playerOneId: number;

  @ApiProperty({ description: '[FK] 두번째 플레이어의 유저 id' })
  playerTwoId: number;

  @ApiProperty({ description: '첫번째 플레이어의 점수' })
  playerOneScore: number;

  @ApiProperty({ description: '두번째 플레이어의 점수' })
  playerTwoScore: number;

  @ApiProperty({ description: '승자 id' })
  winnerId: number;
}
