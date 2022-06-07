import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/emails/email.module';
import { EmailService } from 'src/emails/email.service';
import { UsersController } from './users.controller';
import { User } from './users.entity';
import { UsersService } from './users.service';

@Module({
  exports: [UsersService],
  imports: [TypeOrmModule.forFeature([User]), EmailService, EmailModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
