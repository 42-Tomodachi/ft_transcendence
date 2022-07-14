import { ApiProperty } from '@nestjs/swagger';

export class GameRecordDto {
  @ApiProperty({ description: '래더게임 여부' })
  isLadder: boolean;

  @ApiProperty({ description: '승리 여부' })
  isWin: boolean;

  @ApiProperty({ description: '상대 닉네임' })
  opponentNickname: string;
}
