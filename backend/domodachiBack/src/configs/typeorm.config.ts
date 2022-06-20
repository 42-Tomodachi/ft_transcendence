import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const TypeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'postgresql',
  port: 5432,
  username: 'domodachi',
  password: 'password',
  database: 'domodachiDB',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
};
