import {
  Body,
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

import { DocumentsService } from 'src/app/services/documents.service';
import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: 'admin/documents' })
export class AdminDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async index(@View() view: EdgeView) {
    const documents = await this.documentsService.index();
    return await view.render('pages/admin/documents/index', {
      documents,
    });
  }

  @Get('new')
  async new(@View() view: EdgeView) {
    return await view.render('pages/admin/documents/new');
  }

  @Post()
  async create(@Body() dto: any, @View() view: EdgeView, @Res() res: Response) {
    await this.documentsService.create(dto?.document);
    view.setFlash('notice', '게시물이 작성되었습니다.');
    return res.redirect('/admin/documents');
  }

  @Get(':id/edit')
  async edit(@Param('id', ParseIntPipe) id: number, @View() view: EdgeView) {
    const document = await this.documentsService.getById(id);
    return await view.render('pages/admin/documents/edit', { document });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @View() view: EdgeView,
    @Res() res: Response,
  ) {
    console.log('요청옴!!');
    console.log(dto);
    console.log(id);
    await this.documentsService.update(id, dto?.document);
    view.setFlash('notice', '게시물이 업데이트되었습니다.');
    return res.redirect(303, '/admin/documents');
  }

  @Delete(':id')
  async destroy(
    @Param('id', ParseIntPipe) id: number,
    @View() view: EdgeView,
    @Res() res: Response,
  ) {
    await this.documentsService.destroy(id);
    view.setFlash('notice', '게시물이 삭제되었습니다.');
    return res.redirect(303, '/admin/documents');
  }
}
