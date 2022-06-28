import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/emails/email.module';
import { UsersController } from './users.controller';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';
import { Follow } from './entities/follow.entity';
import { BlockedUser } from './entities/blockedUser.entity';
import { GameRecord } from './entities/gameRecord.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  exports: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User, Follow, BlockedUser, GameRecord]),
    EmailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'tomodachi',
      signOptions: {
        expiresIn: 3600,
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, PassportModule],
})
export class UsersModule {}
