import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsSignedUpDto } from 'src/auth/dto/auth.dto';
import { Repository } from 'typeorm';
import { BlockResultDto } from './dto/blockedUser.dto';
import { GameRecordDto } from './dto/gameRecord.dto';
import {
  UpdateUserDto,
  EmailDto,
  SimpleUserDto,
  UserProfileDto,
  WinLoseCountDto,
} from './dto/users.dto';
import { BlockedUser } from './entities/blockedUser.entity';
import { Follow } from './entities/follow.entity';
import { GameRecord } from './entities/gameRecord.entity';
import { User } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    @InjectRepository(BlockedUser)
    private readonly blockedUserRepo: Repository<BlockedUser>,
    @InjectRepository(GameRecord)
    private readonly gameRecordRepo: Repository<GameRecord>,
  ) {}

  async getUsers(): Promise<SimpleUserDto[]> {
    const users = await this.userRepo.find();

    return users.map((user) => {
      return {
        userId: user.id,
        nickname: user.nickname,
        status: user.userStatus,
      };
    });
  }

  async getFriends(userId: number): Promise<SimpleUserDto[]> {
    if ((await this.userRepo.findOneBy({ id: userId })) === null) {
      throw new BadRequestException('존재하지 않는 유저 입니다.');
    }

    const friends = await this.followRepo
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.follow', 'followee')
      .where('follow.followerId = :userId', { userId })
      .getMany();

    return friends.map((friend) => {
      return {
        userId: friend.follow.id,
        nickname: friend.follow.nickname,
        status: friend.follow.userStatus,
      };
    });
  }

  // 유저가 있을 경우 유저 엔티티를 리턴하고 없을 경우 null을 리턴함
  async getUserByEmail(email: string): Promise<User | null> {
    const ret = await this.userRepo.findOne({ where: { email } });
    return ret;
  }

  // 유저가 있을 경우 유저 엔티티를 리턴하고 없을 경우 null을 리턴함
  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { id } });

    return user;
  }

  async getUserProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new BadRequestException('유저가 존재하지 않습니다.');
    }

    return user.toUserProfileDto();
  }

  async findByNicknameAndUpdateImg(
    id: number,
    fileName: string,
  ): Promise<string> {
    const user = await this.userRepo.findOne({ where: { id } });
    user.avatar = `${process.env.SERVER_ADDRESS}/users/${fileName}`;
    await user.save();

    return user.avatar;
  }

  async createUser(emailDto: EmailDto): Promise<User> {
    const user = new User();
    user.email = emailDto.email;

    return await this.userRepo.save(user);
  }

  async isDuplicateNickname(nickname: string): Promise<boolean> {
    const found = await this.userRepo.findOne({ where: { nickname } });

    if (found) {
      return true;
    }
    return false;
  }

  async addFriend(followerId: number, followId: number): Promise<void> {
    const [followerUser, followUser] = await Promise.all([
      this.getUserById(followerId),
      this.getUserById(followId),
    ]);

    if (!followerUser || !followUser) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }
    if (followerId === followId) {
      throw new BadRequestException('자신을 친구추가할 수 없습니다.');
    }

    if (
      (await this.followRepo.findOneBy({
        followerId: followerId,
        followId: followId,
      })) !== null
    ) {
      throw new BadRequestException('이미 팔로우 하는 유저입니다.');
    }

    const follow = new Follow();
    follow.follower = followerUser;
    follow.follow = followUser;

    await this.followRepo.save(follow);
  }

  async removeFriend(followerId: number, followId: number) {
    const [followerUser, followUser] = await Promise.all([
      this.getUserById(followerId),
      this.getUserById(followId),
    ]);

    if (!followerUser || !followUser) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    if ((await this.followRepo.findOneBy({ followerId, followId })) === null) {
      throw new BadRequestException('팔로우 하지 않는 관계입니다.');
    }

    await this.followRepo.delete({ followerId, followId });
  }

  async getGameRecords(userId: number): Promise<GameRecordDto[]> {
    if ((await this.userRepo.findOneBy({ id: userId })) === null) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    const gameRecords = await this.gameRecordRepo
      .createQueryBuilder('gameRecord')
      .leftJoinAndSelect('gameRecord.playerOne', 'playerOne')
      .leftJoinAndSelect('gameRecord.playerTwo', 'playerTwo')
      .where('gameRecord.playerOneId = :userId', { userId })
      .orWhere('gameRecord.playerTwoId = :userId', { userId })
      .getMany();

    return gameRecords.map((gameRecord) => gameRecord.toGameRecordDto(userId));
  }

  async updateNickname(
    userId: number,
    nicknameForUpdate: string,
  ): Promise<UserProfileDto> {
    if ((await this.userRepo.findOneBy({ id: userId })) === null) {
      throw new BadRequestException('존재하지 않는 유저 입니다.');
    }
    if (await this.isDuplicateNickname(nicknameForUpdate)) {
      throw new BadRequestException('이미 존재하는 닉네임 입니다.');
    }

    const user = await this.getUserById(userId);

    user.nickname = nicknameForUpdate;
    const updatedUser = await this.userRepo.save(user);

    return updatedUser.toUserProfileDto();
  }

  async getWinLoseCount(userId: number): Promise<WinLoseCountDto> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    return user.toWinLoseCount();
  }

  async blockUserToggle(
    myId: number,
    targetId: number,
  ): Promise<BlockResultDto> {
    const myUser = await this.userRepo.findOneBy({ id: myId });
    const targetUser = await this.userRepo.findOneBy({ id: targetId });

    if (!myUser || !targetUser) {
      throw new BadRequestException('유저가 존재하지 않습니다.');
    }

    const block = await this.blockedUserRepo.findOneBy({
      blockerId: myId,
      blockedId: targetId,
    });

    if (block) {
      await this.blockedUserRepo.delete({ id: block.id });

      return { isBlocked: false };
    } else {
      const blockedUserForCreate = new BlockedUser();
      blockedUserForCreate.blockerId = myId;
      blockedUserForCreate.blockedId = targetId;
      await this.blockedUserRepo.save(blockedUserForCreate);

      return { isBlocked: true };
    }
  }
}
