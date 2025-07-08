import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  Flash,
  NestMvcFlash,
  NestMvcReq,
  NestMvcView,
  View,
} from 'nestjs-mvc-tools';
import { CategoriesService } from 'src/app/services/categories.service';

@Controller({ path: 'admin/categories' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async index(@View() view: NestMvcView) {
    const categories = await this.categoriesService.index();
    return view.render('pages/admin/categories/index', { categories });
  }

  @Get('new')
  async new(@View() view: NestMvcView) {
    return view.render('pages/admin/categories/new', {});
  }

  @Post()
  async create(@Req() req: NestMvcReq) {
    console.log(req.body?.category);
    await this.categoriesService.create(req.body?.category);

    req.flash.success('작업 성공');
    return req.view.render('pages/admin/categories/_success');
  }

  @Get(':id/edit')
  async edit(@Param('id', ParseIntPipe) id: number, @View() view: NestMvcView) {
    return view.render('pages/admin/categories/edit', {});
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Flash() flash: NestMvcFlash,
    @Res() res: Response,
  ) {
    flash.success('작업 성공');
    return res.redirect('/admin/categories');
  }

  @Delete(':id')
  async destroy(
    @Param('id', ParseIntPipe) id: number,
    @Flash() flash: NestMvcFlash,
    @Res() res: Response,
  ) {
    await this.categoriesService.destroy(id);
    flash.success('삭제 성공');
    return res.redirect(303, '/admin/categories');
  }
}
