import { ApolloDriverConfig } from '@nestjs/apollo';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import EnvConfig from './config/env.config';
import GraphQLConfig from './config/graphql.config';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { UserEntity } from './user/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './user/entities/verification.entity';
import { MailModule } from './mail/mail.module';

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
      entities: [UserEntity, Verification],
    }),
    JwtModule.forRoot(),
    CommonModule,
    UserModule,
    AuthModule,
    MailModule.forRoot({
      apiKey: 'api-key-from-env',
      domain: 'domain-from-env',
      fromEmail: 'from-email-from-env-file',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.POST,
    });
  }
}
