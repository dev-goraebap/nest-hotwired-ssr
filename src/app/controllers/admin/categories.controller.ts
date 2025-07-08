import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Flash, NestMvcFlash, NestMvcView, View } from 'nestjs-mvc-tools';

@Controller({ path: 'admin/categories' })
export class CategoriesController {
  @Get()
  async index(@View() view: NestMvcView) {
    return view.render('pages/admin/categories/index', {});
  }

  @Get('new')
  async new(@View() view: NestMvcView) {
    return view.render('pages/admin/categories/new', {});
  }

  @Post()
  async create(@Flash() flash: NestMvcFlash, @Res() res: Response) {
    flash.success('작업 성공');
    return res.redirect('/admin/categories');
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
    flash.success('삭제 성공');
    return res.redirect('/admin/categories');
  }
}
