import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const TypeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.HOST,
  port: +process.env.PORT,
  username: 'postgres',
  // username: process.env.USERNAME, // todo: 유저네임을 이 행으로 교체할 경우 에러 발생함.. 왜?
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: true,
};
