import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BuModule } from './bu/bu.module';
import { ThreadsModule } from './threads/threads.module';
import { PostsModule } from './posts/posts.module';
import { RepliesModule } from './replies/replies.module';
import { UpvotesModule } from './upvotes/upvotes.module';
import { DatabaseModule } from './database/database.module';
import { SearchModule } from './search/search.module';
import { CultureBuilderModule } from './culture-builder/culture-builder.module';
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
    AuthModule,
    UsersModule,
    BuModule,
    ThreadsModule,
    PostsModule,
    RepliesModule,
    UpvotesModule,
    DatabaseModule,
    SearchModule,
    CultureBuilderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
