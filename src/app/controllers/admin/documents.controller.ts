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
import { EdgeView, View } from 'nestjs-mvc-tools';

@Controller({ path: 'admin/documents' })
export class DocumentsController {
  @Get()
  async index(@View() view: EdgeView) {
    return view.render('pages/admin/documents/index', {});
  }

  @Get('new')
  async new(@View() view: EdgeView) {
    return view.render('pages/admin/documents/new', {});
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number, @View() view: EdgeView) {
    return view.render('pages/admin/documents/show', {});
  }

  @Post()
  async create(@View() view: EdgeView, @Res() res: Response) {
    view.setFlash('notice', '작업 성공');
    return res.redirect('/admin/documents');
  }

  @Get(':id/edit')
  async edit(@Param('id', ParseIntPipe) id: number, @View() view: EdgeView) {
    return view.render('pages/admin/documents/edit', {});
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @View() view: EdgeView,
    @Res() res: Response,
  ) {
    view.setFlash('notice', '작업 성공');
    return res.redirect('/admin/documents');
  }

  @Delete(':id')
  async destroy(
    @Param('id', ParseIntPipe) id: number,
    @View() view: EdgeView,
    @Res() res: Response,
  ) {
    view.setFlash('notice', '삭제 성공');
    return res.redirect('/admin/documents');
  }
}
