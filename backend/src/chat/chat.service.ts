import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ChatRoomDataDto,
  ChatRoomDto,
  ChatRoomIdDto,
  CreateChatRoomDto,
  UpdateChatRoomDto,
} from './dto/chat.dto';
import { ChatContents } from './entities/chatContents.entity';
import { ChatParticipant } from './entities/chatParticipant.entity';
import { ChatRoom as ChatRoom } from './entities/chattingRoom.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatContents)
    private readonly chatContentsRepo: Repository<ChatContents>,
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantRepo: Repository<ChatParticipant>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepo: Repository<ChatRoom>,
  ) {}

  async getChatRoomById(id: number): Promise<ChatRoom> {
    const chatRoom = await this.chatRoomRepo.findOneOrFail({ where: { id } });

    return chatRoom;
  }

  async getChatRooms(): Promise<ChatRoomDto[]> {
    let chatRooms = await this.chatRoomRepo
      .createQueryBuilder('chattingRoom')
      .leftJoinAndSelect('chattingRoom.chatParticipant', 'chatParticipant')
      .getMany();

    chatRooms = chatRooms.filter((chattingRoom) => !chattingRoom.isDm);

    return chatRooms.map((chattingRoom) => {
      return chattingRoom.toChatRoomDto();
    });
  }

  async getRoomParticipants(roomId: number): Promise<ChatParticipant[]> {
    const chatRoom = await this.getChatRoomById(roomId);

    return chatRoom.chatParticipant;
  }

  async getParticipatingChattingRooms(userId: number): Promise<ChatRoomDto[]> {
    const chattingRooms = await this.chatRoomRepo
      .createQueryBuilder('chattingRoom')
      .leftJoinAndSelect('chattingRoom.chatParticipant', 'chatParticipant')
      .where('chatParticipant.userId = :userId', { userId })
      .getMany();

    return chattingRooms.map((chattingRoom) => {
      return chattingRoom.toChatRoomDto();
    });
  }

  async addUserToChattingRoom(
    chattingRoomId: number,
    userId: number,
    role: 'owner' | 'manager' | 'guest',
  ) {
    const chatParticipant = new ChatParticipant();
    chatParticipant.role = role;
    chatParticipant.chattingRoomId = chattingRoomId;
    chatParticipant.userId = userId;

    this.chatParticipantRepo.save(chatParticipant);
  }

  async createChattingRoom(
    userId: number,
    createChattingRoomDto: CreateChatRoomDto,
  ): Promise<ChatRoomDataDto> {
    const chattingRoom = new ChatRoom();
    chattingRoom.title = createChattingRoomDto.title;
    chattingRoom.password = createChattingRoomDto.password;
    chattingRoom.ownerId = userId;
    chattingRoom.isDm = createChattingRoomDto.isDm;

    const createdChattingRoom = await this.chatRoomRepo.save(chattingRoom);

    await this.addUserToChattingRoom(
      createdChattingRoom.id,
      createdChattingRoom.ownerId,
      'owner',
    );

    const chattingRoomDataDto = new ChatRoomDataDto();
    chattingRoomDataDto.id = createdChattingRoom.id;
    chattingRoomDataDto.title = createdChattingRoom.title;
    chattingRoomDataDto.ownerId = createdChattingRoom.ownerId;

    return chattingRoomDataDto;
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
      chattingRoomId: roomId,
      userId,
    });
  }

  async enterChattingRoom(
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
      chatParticipant.chattingRoomId = roomId;
      chatParticipant.userId = userId;

      await this.chatParticipantRepo.save(chatParticipant);
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

    if (
      !(await this.chatParticipantRepo.findOneBy({
        chattingRoomId: roomId,
        userId,
      }))
    ) {
      throw new BadRequestException('참여중인 채팅방이 아닙니다.');
    }

    if (room.ownerId === userId) {
      await this.chatRoomRepo.delete({ id: roomId });
    } else {
      await this.chatParticipantRepo.delete({ chattingRoomId: roomId, userId });
    }
  }
}
