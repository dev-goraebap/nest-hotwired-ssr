import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { Flash, NestMvcFlash, NestMvcView, View } from 'nestjs-mvc-tools';

import { AuthGuard } from 'src/common/guards/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod.pipe';
import { CreatePostDto, CreatePostSchema } from './dto/create-post.dto';
import { CreatePostUseCase } from './use-cases/create-post.use-case';

@Controller({ path: 'admin/posts' })
@UseGuards(AuthGuard)
export class PostsController {
  constructor(private readonly createPostUseCase: CreatePostUseCase) {}

  @Get()
  index(@View() view: NestMvcView) {
    return view.render('pages/admin/posts/index');
  }

  @Get('new')
  new(@View() view: NestMvcView) {
    return view.render('pages/admin/posts/new');
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreatePostSchema))
  async create(
    @Body() dto: CreatePostDto,
    @Flash() flash: NestMvcFlash,
    @Res() res: Response,
  ) {
    console.log(dto);
    await this.createPostUseCase.execute(dto);
    flash.success('작업 성공');
    return res.redirect('/admin/posts');
  }
}
