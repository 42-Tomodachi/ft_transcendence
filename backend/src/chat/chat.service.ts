import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoomUserDto } from 'src/users/dto/users.dto';
import { BlockedUser } from 'src/users/entities/blockedUser.entity';
import { User } from 'src/users/entities/users.entity';
import { DataSource, Repository } from 'typeorm';
import { callbackify } from 'util';
import { ChatGateway } from './chat.gateway';
import {
  CreateChatContentDto,
  ChatRoomDataDto,
  ChatRoomIdDto,
  CreateChatRoomDto,
  UpdateChatRoomDto,
  RoomPasswordDto,
  BooleanDto,
  ParticipantRoleDto,
} from './dto/chat.dto';
import { ChatContents } from './entities/chatContents.entity';
import { ChatParticipant } from './entities/chatParticipant.entity';
import { ChatRoom as ChatRoom } from './entities/chatRoom.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatContents)
    private readonly chatContentsRepo: Repository<ChatContents>,
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantRepo: Repository<ChatParticipant>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepo: Repository<ChatRoom>,
    private readonly ChatGateway: ChatGateway,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private dataSource: DataSource,
    @InjectRepository(BlockedUser)
    private readonly blockedUserRepo: Repository<BlockedUser>,
  ) {}

  async getChatRoomById(id: number): Promise<ChatRoom> {
    const chatRoom = await this.chatRoomRepo.findOneOrFail({ where: { id } });

    return chatRoom;
  }

  async getChatRooms(): Promise<ChatRoomDataDto[]> {
    let chatRooms = await this.chatRoomRepo
      .createQueryBuilder('chatRoom')
      .leftJoinAndSelect('chatRoom.chatParticipant', 'chatParticipant')
      .getMany();

    chatRooms = chatRooms.filter((chatRoom) => !chatRoom.isDm);

    return chatRooms.map((chatRoom) => {
      return chatRoom.toChatRoomDto();
    });
  }

  async getRoomParticipants(roomId: number): Promise<ChatParticipant[]> {
    const chatRoom = await this.getChatRoomById(roomId);

    return chatRoom.chatParticipant;
  }

  async banUser(roomId: number, callingUserId: number, targetUserId: number): Promise<void> {
    const room = await this.chatRoomRepo.findOneBy({ id: roomId });
    if (!room) {
      throw new BadRequestException('채팅방이 존재하지 않습니다.');
    }
    const chatParticipant = await ChatParticipant.findOneBy({ userId: targetUserId, chatRoomId: roomId });
    if (!chatParticipant) {
      throw new BadRequestException('존재하지 않는 참여자입니다.');
    }
    if (room.isDm === true) {
      throw new BadRequestException('DM방 입니다.');
    }
    const findRole = await ChatParticipant.findOneBy({ userId: callingUserId, chatRoomId: roomId });
    if (findRole.role === 'guest') {
      throw new BadRequestException('권한이 없는 사용자입니다.');
    }
    chatParticipant.isBanned = true;
    await chatParticipant.save();
  }

  async getParticipatingChatRooms(
    userId: number,
  ): Promise<ChatRoomDataDto[]> {
    const chatRooms = await this.chatRoomRepo
      .createQueryBuilder('chattingRoom')
      .leftJoinAndSelect('chattingRoom.chatParticipant', 'chatParticipant')
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
    userId: number,
    createChatRoomDto: CreateChatRoomDto,
  ): Promise<ChatRoomDataDto> {
    const chatRoom = new ChatRoom();
    chatRoom.title = createChatRoomDto.title;
    chatRoom.password = createChatRoomDto.password;
    chatRoom.ownerId = userId;
    chatRoom.isDm = createChatRoomDto.isDm;

    const createdChatRoom = await this.chatRoomRepo.save(chatRoom);

    await this.addUserToChatRoom(
      createdChatRoom.id,
      createdChatRoom.ownerId,
      'owner',
    );

    const chatRoomDataDto = new ChatRoomDataDto();
    chatRoomDataDto.id = createdChatRoom.id;
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
    roomPassword: string,
  ): Promise<boolean> {
    const room = await this.isExistChatRoom(roomId);

    if (!room) {
      throw new BadRequestException('존재하지 않는 채팅방 입니다.');
    }

    if (room.password === roomPassword) {
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

  async enterChatRoom(
    roomId: number,
    userId: number,
    roomPassword: string | null,
  ): Promise<ChatRoomIdDto> {
    if (
      roomPassword &&
      !this.isCorrectPasswordOfChatRoom(roomId, roomPassword)
    ) {
      throw new BadRequestException('채팅방의 비밀번호가 일치하지 않습니다.');
    }

    if (!(await this.isExistMember(roomId, userId))) {
      const chatParticipant = new ChatParticipant();
      chatParticipant.chatRoomId = roomId;
      chatParticipant.userId = userId;
      await this.chatParticipantRepo.save(chatParticipant);

      // 채널 유저들의 유저목록 업데이트
      const chatRoomUserDto = new ChatRoomUserDto();
      chatRoomUserDto.id = userId;
      const user: User = await this.userRepo.findOneBy({ id: userId });
      chatRoomUserDto.nickname = user.nickname;
      this.ChatGateway.server
        .to(roomId.toString())
        .emit('updateUser', chatRoomUserDto);

      // 채널 유저들에게 입장 메세지 전송
      const createChatContentDto = new CreateChatContentDto();
      createChatContentDto.isBroadcast = true;
      createChatContentDto.message = `${user.nickname} 님이 입장하셨습니다.`;
      this.submitChatContent(roomId, userId, createChatContentDto);
    }

    return { chatRoomId: roomId };
  }

  async updateRoom(
    roomId: number,
    ownerId: number,
    updateChatRoomDto: UpdateChatRoomDto,
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

  async exitRoom(roomId: number, userId: number): Promise<void> {
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
      await this.chatRoomRepo.delete({ id: roomId });
      await this.ChatGateway.server.to(roomId.toString()).emit('deleteRoom');
    } else {
      await this.chatParticipantRepo.delete({ chatRoomId: roomId, userId });

      // 방 유저들에게 유저목록 업데이트 지시하기
      const chatParticipants: ChatParticipant[] =
        await this.chatParticipantRepo.find({
          where: [{ chatRoomId: roomId }],
        });
      this.ChatGateway.server
        .to(roomId.toString())
        .emit('updateUserList', chatParticipant);
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

    this.ChatGateway.server
      .to(roomId.toString())
      .emit('updateUserList', targetParticipant);

    const result: ParticipantRoleDto = new ParticipantRoleDto();
    result.role = targetParticipant.role;
    return result;
  }

  async muteCertainParticipant(
    roomId: number,
    userId: number,
  ): Promise<BooleanDto> {
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
    } else {
      chatParticipant.isMuted = true;
    }
    await chatParticipant.save();

    // timer 10 min.

    this.ChatGateway.server
      .to(roomId.toString())
      .emit('updateUserList', chatParticipant);

    const result: BooleanDto = new BooleanDto();
    result.boolean = chatParticipant.isMuted;
    return result;
  }

  async submitChatContent(
    roomId: number,
    userId: number,
    createChatContentDto: CreateChatContentDto,
  ): Promise<void> {
    //채팅 DB에 저장
    const chatContents = new ChatContents();

    chatContents.chatRoomId = roomId;
    chatContents.userId = userId;
    chatContents.content = createChatContentDto.message;
    chatContents.isNotice = createChatContentDto.isBroadcast;
    this.chatContentsRepo.save(chatContents);
    //전체에 emit
    this.ChatGateway.server
      .to(roomId.toString())
      .emit('updateChat', createChatContentDto);
  }

  async enterDmRoom(myId: number, partnerId: number): Promise<ChatRoomDataDto> {
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
      return chatRoom.toChatRoomDataDto();
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
      chatParticipantForMe.chatRoomId = chatRoomDataDto.id;
      chatParticipantForMe.userId = myId;
      chatParticipantForMe.role = 'owner';
      await t.save(chatParticipantForMe);
      const chatParticipantForPartner = new ChatParticipant();
      chatParticipantForPartner.chatRoomId = chatRoomDataDto.id;
      chatParticipantForPartner.userId = partnerId;
      await t.save(chatParticipantForPartner);
    });

    return chatRoomDataDto;
  }

  async getChatContents(
    roomId: number,
    userId: number,
  ): Promise<CreateChatContentDto[]> {
    const { createdTime: participatedTime } =
      await this.chatParticipantRepo.findOneBy({
        chatRoomId: roomId,
        userId,
      });
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
      .getMany();

    return chatContents
      .filter((chatContent) => {
        if (!chatContent.userId) {
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
        return chatContent.toCreateChatContentDto(roomId, userId);
      });
  }
}
