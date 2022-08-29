import { Module } from '@nestjs/common';
import { UserStatusContainer } from './userStatus.service';

@Module({
  providers: [UserStatusContainer],
  exports: [UserStatusContainer],
})
export class UserStatusModule {}
