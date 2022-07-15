import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/users.entity';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { GameRecord } from 'src/users/entities/gameRecord.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.EC2_JWT_SECRET || process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.EC2_JWT_EXPIRESIN || process.env.JWT_EXPIRESIN,
      },
    }),
  ],
  controllers: [GameController],
  providers: [GameService, GameGateway],
  exports: [PassportModule],
})
export class GameModule {}
