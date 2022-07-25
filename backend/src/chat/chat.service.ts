import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockedUser } from 'src/users/entities/blockedUser.entity';
import { User } from 'src/users/entities/users.entity';
import { DataSource, Repository } from 'typeorm';
import { ChatGateway } from './chat.gateway';
import {
  ChatRoomDataDto,
  SetChatRoomDto,
  ChatRoomIdDto,
  ChatRoomDto,
} from './dto/chatRoom.dto';
import {
  ParticipantRoleDto,
  ChatRoomUserDto,
  IsMutedDto,
  ChatParticipantProfileDto,
} from './dto/chatParticipant.dto';
import {
  ChatContentDto,
  CreateChatContentDto,
  FromWhomDto,
  MessageDto,
} from './dto/chatContents.dto';
import { ChatContents } from './entities/chatContents.entity';
import { ChatParticipant } from './entities/chatParticipant.entity';
import { ChatRoom as ChatRoom } from './entities/chatRoom.entity';
import * as bcrypt from 'bcryptjs';
import { EmailService } from 'src/emails/email.service';
import { Cron, SchedulerRegistry, Timeout } from '@nestjs/schedule';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatContents)
    private readonly chatContentsRepo: Repository<ChatContents>,
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantRepo: Repository<ChatParticipant>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepo: Repository<ChatRoom>,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private dataSource: DataSource,
    @InjectRepository(BlockedUser)
    private readonly blockedUserRepo: Repository<BlockedUser>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  private logger: Logger = new Logger('ChatService');

  async getChatRoomById(id: number): Promise<ChatRoom> {
    const chatRoom = await this.chatRoomRepo.findOneOrFail({ where: { id } });

    return chatRoom;
  }

  async getChatRoomData(roomId: number): Promise<ChatRoomDataDto> {
    const chatRoom = await this.chatRoomRepo.findOne({ where: { id: roomId } });

    const chatRoomData = new ChatRoomDataDto();
    chatRoomData.roomId = roomId;
    chatRoomData.title = chatRoom.title;
    chatRoomData.ownerId = chatRoom.ownerId;

    return chatRoomData;
  }

  async getChatRooms(): Promise<ChatRoomDto[]> {
    let chatRooms = await this.chatRoomRepo
      .createQueryBuilder('chatRoom')
      .leftJoinAndSelect('chatRoom.chatParticipant', 'chatParticipant')
      .getMany();

    chatRooms = chatRooms.filter((chatRoom) => !chatRoom.isDm);

    return chatRooms.map((chatRoom) => {
      return chatRoom.toChatRoomDto();
    });
  }

  async getRoomParticipants(roomId: number): Promise<ChatRoomUserDto[]> {
    if (!(await this.chatRoomRepo.findOneBy({ id: roomId }))) {
      throw new BadRequestException('존재하지 않는 채팅방 입니다.');
    }

    const chatParticipants = await this.chatParticipantRepo
      .createQueryBuilder('chatParticipant')
      .leftJoinAndSelect('chatParticipant.user', 'user')
      .where('chatParticipant.chatRoomId = :roomId', { roomId })
      .getMany();

    return chatParticipants.map((chatParticipant) => {
      const chatRoomUserDto = new ChatRoomUserDto();
      chatRoomUserDto.userId = chatParticipant.userId;
      chatRoomUserDto.nickname = chatParticipant.user.nickname;
      chatRoomUserDto.role = chatParticipant.role;

      return chatRoomUserDto;
    });
  }

  async banUser(
    user: User,
    roomId: number,
    callingUserId: number,
    targetUserId: number,
  ): Promise<void> {
    if (user.id !== callingUserId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    const room = await this.chatRoomRepo.findOneBy({ id: roomId });
    if (!room) {
      throw new BadRequestException('채팅방이 존재하지 않습니다.');
    }
    const chatParticipant = await ChatParticipant.findOneBy({
      userId: targetUserId,
      chatRoomId: roomId,
    });
    if (!chatParticipant) {
      throw new BadRequestException('존재하지 않는 참여자입니다.');
    }
    if (room.isDm === true) {
      throw new BadRequestException('DM방 입니다.');
    }
    const findRole = await ChatParticipant.findOneBy({
      userId: callingUserId,
      chatRoomId: roomId,
    });
    if (findRole.role === 'guest') {
      throw new BadRequestException('권한이 없는 사용자입니다.');
    }
    chatParticipant.isBanned = true;
    await chatParticipant.save();
  }

  async getParticipatingChatRooms(
    user: User,
    userId: number,
  ): Promise<ChatRoomDto[]> {
    if (user.id !== userId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    const chatRooms = await this.chatRoomRepo
      .createQueryBuilder('chatRoom')
      .leftJoinAndSelect('chatRoom.chatParticipant', 'chatParticipant')
      .where('chatParticipant.userId = :userId', { userId })
      .getMany();

    return chatRooms.map((chatRoom) => {
      return chatRoom.toChatRoomDto();
    });
  }

  async addUserToChatRoom(
    chatRoomId: number,
    userId: number,
    role: 'owner' | 'manager' | 'guest',
  ) {
    const chatParticipant = new ChatParticipant();
    chatParticipant.role = role;
    chatParticipant.chatRoomId = chatRoomId;
    chatParticipant.userId = userId;

    await this.chatParticipantRepo.save(chatParticipant);
  }

  async createChatRoom(
    user: User,
    userId: number,
    createChatRoomDto: SetChatRoomDto,
  ): Promise<ChatRoomDataDto> {
    if (user.id !== userId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }

    const chatRoom = new ChatRoom();
    chatRoom.title = createChatRoomDto.title;
    if (createChatRoomDto.password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(
        createChatRoomDto.password,
        salt,
      );
      chatRoom.password = hashedPassword;
    }
    chatRoom.ownerId = userId;

    const createdChatRoom = await this.chatRoomRepo.save(chatRoom);

    await this.addUserToChatRoom(
      createdChatRoom.id,
      createdChatRoom.ownerId,
      'owner',
    );

    // 입장 메세지 db에 저장
    await this.chatContentsRepo.save({
      chatRoomId: createdChatRoom.id,
      userId,
      content: `님이 입장 하셨습니다.`,
      isNotice: true,
    });

    const chatRoomDataDto = new ChatRoomDataDto();
    chatRoomDataDto.roomId = createdChatRoom.id;
    chatRoomDataDto.title = createdChatRoom.title;
    chatRoomDataDto.ownerId = createdChatRoom.ownerId;

    return chatRoomDataDto;
  }

  // 채팅방이 존재할 경우 채팅방 엔티티를 리턴하고 존재하지 않을 경우 null을 리턴함
  async isExistChatRoom(roomId: number): Promise<ChatRoom | null> {
    return await this.chatRoomRepo.findOneBy({ id: roomId });
  }

  async isCorrectPasswordOfChatRoom(
    roomId: number,
    roomPassword: string | null,
  ): Promise<boolean> {
    const room = await this.isExistChatRoom(roomId);

    if (!room) {
      throw new BadRequestException('존재하지 않는 채팅방 입니다.');
    }
    if (!room.password) {
      return true;
    }
    if (room.password && !roomPassword) {
      throw new BadRequestException('비밀번호를 입력해 주세요.');
    }
    if (await bcrypt.compare(roomPassword, room.password)) {
      return true;
    }
    return false;
  }

  // 채팅방 참여자일 경우 chatParticipant 엔티티 리턴, 참여자가 아닐 경우 null 리턴
  async isExistMember(roomId: number, userId: number) {
    return await this.chatParticipantRepo.findOneBy({
      chatRoomId: roomId,
      userId,
    });
  }

  async getChatContentDtoForEmit(
    chatContentId: number,
    userId?: number,
  ): Promise<ChatContentDto> {
    const createdChatcontent = await this.chatContentsRepo
      .createQueryBuilder('chatContent')
      .leftJoinAndSelect('chatContent.user', 'user')
      .where('chatContent.id = :chatContentId', {
        chatContentId,
      })
      .getOne();

    if (createdChatcontent.isNotice) {
      return createdChatcontent.toChatContentDto();
    }
    return createdChatcontent.toChatContentDto(createdChatcontent.userId);
  }

  async enterChatRoom(
    user: User,
    roomId: number,
    userId: number,
    roomPassword: string | null,
  ): Promise<ChatRoomIdDto> {
    if (!(await this.isCorrectPasswordOfChatRoom(roomId, roomPassword))) {
      throw new BadRequestException('채팅방의 비밀번호가 일치하지 않습니다.');
    }
    if (user.id !== userId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }

    if (!(await this.isExistMember(roomId, userId))) {
      const chatParticipant = new ChatParticipant();
      chatParticipant.chatRoomId = roomId;
      chatParticipant.userId = userId;
      await this.chatParticipantRepo.save(chatParticipant);

      // 입장 메세지 db에 저장
      const { id: createdChatContentId } = await this.chatContentsRepo.save({
        chatRoomId: roomId,
        userId: user.id,
        content: `님이 입장 하셨습니다.`,
        isNotice: true,
      });

      // 채널 유저들에게 입장 메세지 전송
      this.chatGateway.sendNoticeMessage(
        roomId,
        await this.getChatContentDtoForEmit(createdChatContentId),
      );
    }

    return { roomId: roomId };
  }

  async updateRoom(
    roomId: number,
    ownerId: number,
    updateChatRoomDto: SetChatRoomDto,
  ): Promise<ChatRoomDataDto> {
    const room = await this.chatRoomRepo.findOneBy({ id: roomId });
    if (!room) {
      throw new BadRequestException('채팅방이 존재하지 않습니다.');
    }
    if (room.ownerId !== ownerId) {
      throw new BadRequestException(
        '채팅방의 소유자만 방 설정을 변경할 수 있습니다.',
      );
    }

    room.title = updateChatRoomDto.title;
    room.password = updateChatRoomDto.password;

    const updatedRoom = await this.chatRoomRepo.save(room);
    return updatedRoom.toChatRoomDataDto();
  }

  async exitRoom(user: User, roomId: number, userId: number): Promise<void> {
    if (user.id !== userId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }

    const room = await this.chatRoomRepo.findOneBy({ id: roomId });
    if (!room) {
      throw new BadRequestException('채팅방이 존재하지 않습니다.');
    }

    const chatParticipant = await this.chatParticipantRepo.findOneBy({
      chatRoomId: roomId,
      userId,
    });

    if (!chatParticipant) {
      throw new BadRequestException('참여중인 채팅방이 아닙니다.');
    }

    if (room.isDm) {
      userId = room.ownerId;
    }

    if (room.ownerId === userId) {
      // 방 폭파 + 방에서 다 내보내기
      this.chatGateway.wss.socketsLeave(roomId.toString());
      await this.chatRoomRepo.delete({ id: roomId });
    } else {
      await this.chatParticipantRepo.delete({ chatRoomId: roomId, userId });

      // 퇴장 메세지 db에 저장
      const { id: createdChatContentId } = await this.chatContentsRepo.save({
        chatRoomId: roomId,
        userId: user.id,
        content: `님이 퇴장 하셨습니다.`,
        isNotice: true,
      });

      // 채널 유저들에게 퇴장 메세지 전송
      this.chatGateway.sendNoticeMessage(
        roomId,
        await this.getChatContentDtoForEmit(createdChatContentId),
      );
    }
  }

  async toggleParticipantRole(
    roomId: number,
    callingUserId: number,
    targetUserId: number,
  ): Promise<ParticipantRoleDto> {
    const room = await this.chatRoomRepo.findOneBy({ id: roomId });
    if (!room) {
      throw new BadRequestException('채팅방이 존재하지 않습니다.');
    }

    const chatParticipants: ChatParticipant[] =
      await this.chatParticipantRepo.find({
        where: [{ chatRoomId: roomId }],
      });
    const targetParticipant: ChatParticipant = chatParticipants.find(
      (participant) => participant.userId === targetUserId,
    );
    const callingParticipant: ChatParticipant = chatParticipants.find(
      (participant) => participant.userId === callingUserId,
    );

    if (!targetParticipant) {
      throw new BadRequestException('존재하지 않는 참여자입니다.');
    }

    if (targetParticipant.role === 'guest') {
      if (callingParticipant.role === 'guest') {
        throw new BadRequestException('변경 권한이 없습니다.');
      }
      targetParticipant.role = 'manager';
    } else if (targetParticipant.role === 'manager') {
      if (callingParticipant.role !== 'owner') {
        throw new BadRequestException('변경 권한이 없습니다.');
      }
      targetParticipant.role = 'guest';
    } else {
      throw new BadRequestException('Owner는 절대권력 입니다.');
    }
    await targetParticipant.save();

    this.chatGateway.wss
      .to(roomId.toString())
      .emit('updateUserList', targetParticipant);

    const result: ParticipantRoleDto = new ParticipantRoleDto();
    result.role = targetParticipant.role;
    return result;
  }

  async muteCertainParticipant(
    roomId: number,
    userId: number,
  ): Promise<IsMutedDto> {
    const room = await this.chatRoomRepo.findOneBy({ id: roomId });
    if (!room) {
      throw new BadRequestException('채팅방이 존재하지 않습니다.');
    }

    const chatParticipants: ChatParticipant[] =
      await this.chatParticipantRepo.find({
        where: [{ chatRoomId: roomId }],
      });
    const chatParticipant: ChatParticipant = chatParticipants.find(
      (participant) => participant.userId === userId,
    );

    if (!chatParticipant) {
      throw new BadRequestException('존재하지 않는 참여자입니다.');
    }

    if (chatParticipant.isMuted) {
      chatParticipant.isMuted = false;
      this.deleteMuteTimeout(`muteTimeout${chatParticipant.id}`);
    } else {
      chatParticipant.isMuted = true;
      this.addMuteTimeout(
        `muteTimeout${chatParticipant.id}`,
        10 * 1000,
        chatParticipant,
      );
    }
    await chatParticipant.save();

    this.chatGateway.wss
      .to(roomId.toString())
      .emit('updateUserList', chatParticipant);

    const result: IsMutedDto = new IsMutedDto();
    result.isMuted = chatParticipant.isMuted;
    return result;
  }

  async createChatContent(
    userId: number,
    roomId: number,
    msg: string,
  ): Promise<ChatContentDto> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }
    const room = await this.chatRoomRepo.findOneBy({ id: roomId });
    if (!room) {
      throw new BadRequestException('존재하지 않는 채팅방입니다.');
    }

    const { id: createdChatContentId } = await this.chatContentsRepo.save({
      chatRoomId: roomId,
      userId,
      content: msg,
    });

    return await this.getChatContentDtoForEmit(createdChatContentId, userId);
  }

  async isMessageFromBlockedUser(
    blockerId: number,
    blockedId: number,
  ): Promise<boolean> {
    const found = await this.blockedUserRepo.findOneBy({
      blockerId,
      blockedId,
    });

    if (found) {
      return true;
    }
    return false;
  }

  async submitChatContent(
    user: User,
    roomId: number,
    userId: number,
    messageDto: MessageDto,
  ): Promise<void> {
    if (user.id !== userId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    if (
      !(await this.chatParticipantRepo.findOneBy({
        chatRoomId: roomId,
        userId: userId,
      }))
    ) {
      throw new BadRequestException('잘못된 유저나 채팅방입니다.');
    }
    //채팅 DB에 저장
    const chatContents = new ChatContents();
    chatContents.chatRoomId = roomId;
    chatContents.userId = userId;
    chatContents.content = messageDto.message;
    await this.chatContentsRepo.save(chatContents);
    //전체에 emit
    // this.chatGateway.wss.to(roomId.toString()).emit('updateChat', messageDto);
  }

  async enterDmRoom(
    user: User,
    myId: number,
    partnerId: number,
  ): Promise<ChatRoomIdDto> {
    if (user.id !== myId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    const chatRooms = await this.chatRoomRepo
      .createQueryBuilder('chatRoom')
      .leftJoinAndSelect('chatRoom.chatParticipant', 'chatParticipant')
      .where('chatRoom.isDm = true')
      .andWhere('chatRoom.ownerId = :myId or chatRoom.ownerId = :partnerId', {
        myId,
        partnerId,
      })
      .getMany();

    const chatRoom = chatRooms.find((chatRoom) => {
      let isCorrectMember = 0;

      chatRoom.chatParticipant.forEach((person) => {
        if (person.userId === myId || person.userId === partnerId) {
          ++isCorrectMember;
        }
      });

      if (isCorrectMember === 2) {
        return true;
      } else {
        return false;
      }
    });

    if (chatRoom) {
      return { roomId: chatRoom.id };
    }

    const myUser = await this.userRepo.findOneBy({ id: myId });
    const partnerUser = await this.userRepo.findOneBy({ id: partnerId });
    if (!myUser || !partnerUser) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    let chatRoomDataDto: ChatRoomDataDto;
    await this.dataSource.transaction(async (t) => {
      const chatRoomForCreate = new ChatRoom();
      chatRoomForCreate.title = `Dm Room of ${myUser.nickname} and ${partnerUser.nickname}`;
      chatRoomForCreate.ownerId = myId;
      chatRoomForCreate.isDm = true;

      chatRoomDataDto = (await t.save(chatRoomForCreate)).toChatRoomDataDto();

      const chatParticipantForMe = new ChatParticipant();
      chatParticipantForMe.chatRoomId = chatRoomDataDto.roomId;
      chatParticipantForMe.userId = myId;
      chatParticipantForMe.role = 'owner';
      await t.save(chatParticipantForMe);
      const chatParticipantForPartner = new ChatParticipant();
      chatParticipantForPartner.chatRoomId = chatRoomDataDto.roomId;
      chatParticipantForPartner.userId = partnerId;
      await t.save(chatParticipantForPartner);
    });

    return { roomId: chatRoomDataDto.roomId };
  }

  async getChatContentsForEmit(
    roomId: number,
    userId: number,
  ): Promise<ChatContentDto[]> {
    const participant = await this.chatParticipantRepo.findOneBy({
      chatRoomId: roomId,
      userId,
    });
    if (!participant) {
      throw new BadRequestException('참여중인 채팅방이 아닙니다.');
    }

    const { createdTime: participatedTime } = participant;

    const blockedUsers = await this.blockedUserRepo.findBy({
      blockerId: userId,
    });

    const chatContents = await this.chatContentsRepo
      .createQueryBuilder('chatContents')
      .leftJoinAndSelect('chatContents.user', 'user')
      .leftJoinAndSelect('user.chatParticipant', 'chatParticipant')
      .where('chatContents.chatRoomId = :roomId', { roomId })
      .andWhere('chatContents.createdTime > :participatedTime', {
        participatedTime,
      })
      .orderBy('chatContents.createdTime', 'ASC')
      .getMany();

    const result = chatContents
      .filter((chatContent) => {
        if (chatContent.isNotice) {
          return true;
        }

        for (const blockedUser of blockedUsers) {
          if (
            chatContent.userId === blockedUser.blockedId &&
            chatContent.createdTime > blockedUser.createdTime
          ) {
            return false;
          }
        }
        return true;
      })
      .map((chatContent) => {
        return chatContent.toChatContentDto(userId);
      });

    return result;
  }

  async getChatContents(
    user: User,
    roomId: number,
    userId: number,
  ): Promise<ChatContentDto[]> {
    if (user.id !== userId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    const participant = await this.chatParticipantRepo.findOneBy({
      chatRoomId: roomId,
      userId,
    });
    if (!participant) {
      throw new BadRequestException('참여중인 채팅방이 아닙니다.');
    }
    const { createdTime: participatedTime } = participant;
    const blockedUsers = await this.blockedUserRepo.findBy({
      blockerId: userId,
    });

    const chatContents = await this.chatContentsRepo
      .createQueryBuilder('chatContents')
      .leftJoinAndSelect('chatContents.user', 'user')
      .leftJoinAndSelect('user.chatParticipant', 'chatParticipant')
      .where('chatContents.chatRoomId = :roomId', { roomId })
      .andWhere('chatContents.createdTime > :participatedTime', {
        participatedTime,
      })
      .orderBy('chatContents.createdTime', 'ASC')
      .getMany();

    const result = chatContents
      .filter((chatContent) => {
        if (chatContent.isNotice) {
          return true;
        }

        for (const blockedUser of blockedUsers) {
          if (
            chatContent.userId === blockedUser.blockedId &&
            chatContent.createdTime > blockedUser.createdTime
          ) {
            return false;
          }
        }
        return true;
      })
      .map((chatContent) => {
        return chatContent.toChatContentDto(userId);
      });

    return result;
  }

  async getChatParticipantProfile(
    user: User,
    roomId: number,
    myId: number,
    targetId: number,
  ): Promise<ChatParticipantProfileDto> {
    if (user.id !== myId) {
      throw new BadRequestException('잘못된 유저의 접근입니다.');
    }
    const myUser = await this.chatParticipantRepo.findOneBy({
      chatRoomId: roomId,
      userId: myId,
    });
    const targetUser = await this.chatParticipantRepo.findOneBy({
      chatRoomId: roomId,
      userId: targetId,
    });
    if (!myUser || !targetUser) {
      throw new BadRequestException('채팅방에 유저가 존재하지 않습니다.');
    }

    const foundChatParticipant = await this.chatParticipantRepo
      .createQueryBuilder('chatParticipant')
      .leftJoinAndSelect('chatParticipant.user', 'user')
      .leftJoinAndSelect('user.follow', 'follow')
      .leftJoinAndSelect('user.blocked', 'blocked')
      .where('chatParticipant.chatRoomId = :roomId', { roomId })
      .andWhere('chatParticipant.userId = :targetId', { targetId })
      .getOneOrFail();

    return {
      ...foundChatParticipant.user.toUserProfileDto(myId),
      isMuted: foundChatParticipant.isMuted,
      role: foundChatParticipant.role,
    };
  }

  async isMutedUser(roomId: number, userId: number): Promise<boolean> {
    const chatParticipant = await this.chatParticipantRepo.findOneBy({
      chatRoomId: roomId,
      userId,
    });

    if (!chatParticipant) {
      throw new BadRequestException(
        `해당하는 채팅방에 참여중인 유저가 아닙니다.`,
      );
    }

    return chatParticipant.isMuted;
  }

  addMuteTimeout(
    name: string,
    milliseconds: number,
    chatParticipant: ChatParticipant,
  ) {
    const callback = () => {
      chatParticipant.isMuted = false;
      chatParticipant.save();
      this.logger.warn(
        `Timeout ${name}(name) executed. Now ${chatParticipant.id}(chatParticipantId) is unMuted.`,
      );
      this.schedulerRegistry.deleteTimeout(name);
    };

    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(name, timeout);
  }

  deleteMuteTimeout(name: string) {
    this.schedulerRegistry.deleteTimeout(name);
    this.logger.warn(`Timeout ${name}(name) deleted!`);
  }
}
