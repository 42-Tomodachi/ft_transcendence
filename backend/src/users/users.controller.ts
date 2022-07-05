import {
  Controller,
  Get,
  Body,
  Post,
  Put,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';
import {
  NicknameDto,
  SimpleUserDto,
  TargetIdDto,
  UserProfileDto,
  WinLoseCountDto,
} from './dto/users.dto';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../files/file-uploading.utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { GameRecordDto } from './dto/gameRecord.dto';
import { FollowIdDto } from './dto/follow.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetJwtUser } from 'src/auth/jwt.strategy';
import { BlockResultDto } from './dto/blockedUser.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '[test for dev] 회원 닉네임/아바타 초기화' })
  @Get('reset/:id')
  async resetUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.usersService.getUserById(id);

    user.nickname = null;
    user.avatar = null;
    await user.save();
    return user;
  }

  @ApiOperation({ summary: 'seungyel✅ 이미지 업로드' })
  @Post('/:myId/uploadImage')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './files',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadedFile(@UploadedFile() file, @Param('myId') id: number) {
    const response = {
      originalname: file.originalname,
      filename: file.filename,
      UpdateImg: await this.usersService.findByNicknameAndUpdateImg(
        id,
        file.filename,
      ),
    };
    return response;
  }

  // @ApiBearerAuth('access-token') //JWT 토큰 키 설정
  // @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'kankim✅ 모든 유저의 id, 닉네임, 상태 가져오기' })
  @Get('')
  async getUsers(): Promise<SimpleUserDto[]> {
    const userInfo = await this.usersService.getUsers();

    return userInfo;
  }

  @ApiOperation({ summary: '✅ 본인 정보 가져오기' })
  @Get('/own')
  @UseGuards(AuthGuard())
  async getOwnInfo(@GetJwtUser() user: User): Promise<UserProfileDto> {
    return user.toUserProfileDto();
  }

  @ApiOperation({ summary: 'kankim✅ 특정 유저의 프로필 조회' })
  @Get(':myId')
  @UseGuards(AuthGuard())
  async getUserProfile(
    @Param('myId', ParseIntPipe) myId: number,
<<<<<<< HEAD
    @Query('targetId', ParseIntPipe) targetId: number,
  ): Promise<UserProfileDto> {
    const userProfile = await this.usersService.getUserProfile(myId, targetId);
=======
    @Body() target: TargetIdDto,
    @GetJwtUser() user: User,
  ): Promise<UserProfileDto> {
    const userProfile = await this.usersService.getUserProfile(
      user,
      myId,
      target.targetId,
    );
>>>>>>> 77db0c2c ([BE] FEAT: authGuard added on User, Auth module -sy)

    return userProfile;
  }

  @ApiOperation({ summary: 'kankim✅ 친구 추가' })
  @Post(':myId/friends')
  @UseGuards(AuthGuard())
  async addFriend(
    @GetJwtUser() user: User,
    @Param('myId', ParseIntPipe) followerId: number,
    @Body() followIdDto: FollowIdDto,
  ): Promise<void> {
    await this.usersService.addFriend(user, followerId, followIdDto.followId);
  }

  @ApiOperation({ summary: 'kankim✅ 친구 삭제' })
  @Delete(':myId/friends')
  @UseGuards(AuthGuard())
  async removeFriend(
    @GetJwtUser() user: User,
    @Param('myId', ParseIntPipe) followerId: number,
    @Body() followIdDto: FollowIdDto,
  ): Promise<void> {
    await this.usersService.removeFriend(
      user,
      followerId,
      followIdDto.followId,
    );
  }

  @ApiOperation({ summary: 'kankim✅ 친구 목록( id, 닉네임 ) 조회' })
  @Get(':myId/friends')
  async getFriends(
    @GetJwtUser() user: User,
    @Param('myId', ParseIntPipe) userId: number,
  ): Promise<SimpleUserDto[]> {
    return await this.usersService.getFriends(user, userId);
  }

  @ApiOperation({ summary: 'kankim✅ 전적 조회' })
  @Get(':userId/gameRecords')
  async getGameRecords(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<GameRecordDto[]> {
    const gameRecords = this.usersService.getGameRecords(userId);

    return gameRecords;
  }

  @ApiOperation({ summary: 'kankim✅ 닉네임 변경' })
  @Put(':myId/nickname')
  @UseGuards(AuthGuard())
  async updateNickname(
    @GetJwtUser() user: User,
    @Param('myId', ParseIntPipe) userId: number,
    @Body() nicknameDto: NicknameDto,
  ): Promise<UserProfileDto> {
    const users = await this.usersService.updateNickname(
      user,
      userId,
      nicknameDto.nickname,
    );

    return users;
  }

  @ApiOperation({ summary: 'kankim✅ 유저의 승,패 카운트 조회' })
  @Get(':userId/winLoseCount')
  async getWinLoseCount(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<WinLoseCountDto> {
    return await this.usersService.getWinLoseCount(userId);
  }

  @ApiOperation({
    summary:
      'kankim✅ 유저 차단하기 토글. target유저를 차단했으면 true, 차단 해제 했으면 false 리턴',
  })
  @Put(':myId')
  @UseGuards(AuthGuard())
  async blockUserToggle(
    @GetJwtUser() user: User,
    @Param('myId', ParseIntPipe) myId: number,
    @Body() target: TargetIdDto,
  ): Promise<BlockResultDto> {
    return await this.usersService.blockUserToggle(user, myId, target.targetId);
  }
}
