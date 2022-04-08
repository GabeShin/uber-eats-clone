import { ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import * as Joi from 'joi'; // javascript package
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import EnvConfig from './config/env.config';
import GraphQLConfig from './config/graphql.config';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { UserEntity } from './user/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(EnvConfig),
    GraphQLModule.forRoot<ApolloDriverConfig>(GraphQLConfig),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      logging: process.env.NODE_ENV !== 'prod',
      synchronize: process.env.NODE_ENV !== 'prod',
      entities: [UserEntity],
    }),
    CommonModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
