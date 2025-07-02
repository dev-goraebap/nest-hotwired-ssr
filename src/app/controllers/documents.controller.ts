import { Body, Controller, Get, Post, Res, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';

import { CrsfProtectedInterceptor, EdgeView, View } from 'src/shared/edge-in-nest';
import { DocumentsService } from '../services/documents.service';

@Controller({ path: 'documents' })
export class DocumentsController {

  constructor(
    private readonly documentsService: DocumentsService
  ) {}

  @Get()
  async index(@View() view: EdgeView) {
    return await view.render('pages/documents/index');
  }

  @Get('new')
  async new(@View() view: EdgeView) {
    return await view.render('pages/documents/new');
  }

  @Post()
  @UseInterceptors(CrsfProtectedInterceptor)
  async create(@Body() dto: any, @View() view: EdgeView, @Res() res: Response) {
    await this.documentsService.create(dto);
    view.setFlash('notice', '게시물이 작성되었습니다.');
    return res.redirect('/documents');
  }

  @Get(':id/edit')
  async edit(@View() view: EdgeView) {
    return await view.render('pages/documents/edit');
  }
}
