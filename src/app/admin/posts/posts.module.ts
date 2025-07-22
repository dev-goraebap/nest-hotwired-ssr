import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { CreatePostUseCase } from './use-cases/create-post.use-case';

@Module({
  imports: [],
  controllers: [PostsController],
  providers: [CreatePostUseCase],
})
export class PostsModule {}
