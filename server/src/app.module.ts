import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BuModule } from './bu/bu.module';
import { ThreadsModule } from './threads/threads.module';
import { PostsModule } from './posts/posts.module';
import { RepliesModule } from './replies/replies.module';
import { UpvotesModule } from './upvotes/upvotes.module';
import { DatabaseModule } from './database/database.module';
import { SearchModule } from './search/search.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: configService.get<string>('DB_HOST', 'localhost'),
    //     port: configService.get<number>('DB_PORT', 5432),
    //     username: configService.get<string>('DB_USERNAME', 'postgres'),
    //     password: configService.get<string>('DB_PASSWORD', 'postgres'),
    //     database: configService.get<string>('DB_NAME', 'compass'),
    //     entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //     synchronize: configService.get<string>('NODE_ENV') === 'development',
    //     logging: configService.get<string>('NODE_ENV') === 'development',
    //   }),
    //   inject: [ConfigService],
    // }),
    AuthModule,
    UsersModule,
    BuModule,
    ThreadsModule,
    PostsModule,
    RepliesModule,
    UpvotesModule,
    DatabaseModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
