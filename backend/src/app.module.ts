import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import configEmail from './configs/email';
import * as path from 'path';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeORMConfig } from './configs/typeorm.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './logger.middleware';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { TransformInterceptor } from './response.interceptor';
import { UsersService } from './users/users.service';
import { ChatModule } from './chat/chat.module';
import { MulterModule } from '@nestjs/platform-express';
import { GameModule } from './game/game.module';
import { ChatGateway } from './chat/chat.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from '@adminjs/nestjs';
import { ChatContents } from './chat/entities/chatContents.entity';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/typeorm';
import { ChatParticipant } from './chat/entities/chatParticipant.entity';
import { ChatRoom } from './chat/entities/chatRoom.entity';
import { BlockedUser } from './users/entities/blockedUser.entity';
import { Follow } from './users/entities/follow.entity';
import { GameRecord } from './users/entities/gameRecord.entity';
import { User } from './users/entities/users.entity';

AdminJS.registerAdapter({ Database, Resource });

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MulterModule.register({
      dest: './src/files',
    }),
    TypeOrmModule.forRoot(TypeORMConfig),
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configEmail],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('===== write [.env] by config: network====');
        console.log(config.get('email'));
        return {
          ...config.get('email'),
          template: {
            dir: path.join(__dirname, '/templates/'),
            adapter: new EjsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    ChatModule,
    GameModule,
    AdminModule.createAdmin({
      adminJsOptions: {
        rootPath: '/admin',
        resources: [
          ChatContents,
          ChatParticipant,
          ChatRoom,
          BlockedUser,
          Follow,
          GameRecord,
          User,
        ],
        branding: {
          companyName: process.env.TYPEORM_DATABASE + ' 관리자 페이지',
          logo: false,
        },
      },
      auth: {
        authenticate: async (email, password) => {
          if (
            process.env.ADMINJS_EMAIL === email &&
            process.env.ADMINJS_PASSWORD === password
          ) {
            return { email };
          }
          return null;
        },
        cookieName: process.env.ADMINJS_COOKIENAME,
        cookiePassword: process.env.ADMINJS_COOKIEPASSWORD,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // class-validator 사용 시 예외 필터에서 에러 메세지가 모두 HttpException에 해당하는 것으로 출력되어 주석 처리함.
    // todo: class-validator 사용 시 예외 필터 사용방법 서치
    // {
    //   provide: APP_FILTER,
    //   useClass: AllExceptionsFilter,
    // },
    // 프론트 요청으로 응답 인터셉터 주석 처리함.
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: TransformInterceptor,
    // },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
