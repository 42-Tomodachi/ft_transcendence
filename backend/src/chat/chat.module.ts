import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { BlockedUser } from 'src/users/entities/blockedUser.entity';
import { User } from 'src/users/entities/users.entity';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatContents } from './entities/chatContents.entity';
import { ChatParticipant } from './entities/chatParticipant.entity';
import { ChatRoom } from './entities/chattingRoom.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatContents,
      ChatParticipant,
      ChatRoom,
      User,
      BlockedUser,
    ]),
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
