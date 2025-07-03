import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res
} from '@nestjs/common';

import { Response } from 'express';
import { EdgeView, View } from 'src/shared/edge-in-nest';
import { CategoriesService } from '../services/categories.service';

@Controller({ path: 'categories' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async index(@View() view: EdgeView) {
    const categories = await this.categoriesService.index();
    return await view.render('pages/documents/categories/index_turbo_frame', {
      categories,
    });
  }

  @Post()
  async create(@Body() dto: any, @View() view: EdgeView, @Res() res: Response) {
    console.log(dto);
    await this.categoriesService.create(dto?.name);
    view.setFlash('notice', '카테고리 생성 완료');
    return res.redirect('/categories');
  }

  @Patch(':id/name')
  updateName() {}

  @Patch('ranks')
  updateRanks() {}

  @Delete(':id')
  async destroy(
    @Param('id', ParseIntPipe) id: number,
    @View() view: EdgeView,
    @Res() res: Response,
  ) {
    await this.categoriesService.destroy(id);
    view.setFlash('notice', '카테고리 삭제 완료');
    return res.redirect(303, '/categories');
  }
}
