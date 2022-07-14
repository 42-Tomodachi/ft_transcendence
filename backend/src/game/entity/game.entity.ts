import { ApiProperty } from '@nestjs/swagger';

export class GameRoomEntity {
  @ApiProperty({ description: '[PK] 게임방 id' })
  gameId: number;

  @ApiProperty({ description: '게임방 제목' })
  roomTitle: string;

  @ApiProperty({ description: '게임방 비밀번호' })
  password: string | null;

  @ApiProperty({ description: '게임방 인원 수' })
  playerCount: number;

  @ApiProperty({ description: '게임방이 공개방인지 여부' })
  isPublic: boolean;

  @ApiProperty({ description: '게임방이 게임중인지 여부' })
  isStart: boolean;

  @ApiProperty({ description: '1P 유저 id' })
  firstPlayer: number;

  @ApiProperty({ description: '2P 유저 id' })
  secondPlayer: number | null;
}
