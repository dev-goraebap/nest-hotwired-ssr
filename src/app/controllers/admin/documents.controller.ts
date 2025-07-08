import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import {
  Flash,
  MvcValidationException,
  NestMvcFlash,
  NestMvcReq,
  NestMvcView,
  View
} from 'nestjs-mvc-tools';

@Controller({ path: 'admin/documents' })
export class DocumentsController {
  @Get()
  async index(@View() view: NestMvcView) {
    return view.render('pages/admin/documents/index', {});
  }

  @Get('new')
  async new(@View() view: NestMvcView) {
    return view.render('pages/admin/documents/new', {});
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number, @View() view: NestMvcView) {
    return view.render('pages/admin/documents/show', {});
  }

  @Post()
  async create(@Req() req: NestMvcReq, @Res() res: Response) {
    // 제공되는 MVC 예외처리. 내부적으로 양식에 작성했던 데이터를 그대로 화면에 전달
    throw new MvcValidationException('작업 실패');
    if (!req.body) {
    }
    req.flash.success('작업 성공');
    return res.redirect('/admin/documents');
  }

  @Get(':id/edit')
  async edit(@Param('id', ParseIntPipe) id: number, @View() view: NestMvcView) {
    return view.render('pages/admin/documents/edit', {});
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Flash() flash: NestMvcFlash,
    @Res() res: Response,
  ) {
    flash.success('작업 성공');
    return res.redirect('/admin/documents');
  }

  @Delete(':id')
  async destroy(
    @Param('id', ParseIntPipe) id: number,
    @Flash() flash: NestMvcFlash,
    @Res() res: Response,
  ) {
    flash.success('삭제 성공');
    return res.redirect('/admin/documents');
  }
}
