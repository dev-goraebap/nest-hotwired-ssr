import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res
} from '@nestjs/common';
import { Response } from 'express';

import {
  EdgeView,
  View,
} from 'src/shared/edge-in-nest';

import { DocumentEntity } from '../entities/document.entity';
import { DocumentsService } from '../services/documents.service';

@Controller({ path: 'documents' })
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async index(@View() view: EdgeView) {
    const documents = await this.documentsService.index();
    return await view.render('pages/documents/index', {
      documents,
    });
  }

  @Get('new')
  async new(@View() view: EdgeView) {
    return await view.render('pages/documents/new');
  }

  @Post()
  async create(@Body() dto: any, @View() view: EdgeView, @Res() res: Response) {
    await this.documentsService.create(dto?.document);
    view.setFlash('notice', '게시물이 작성되었습니다.');
    return res.redirect('/documents');
  }

  @Get(':id/edit')
  async edit(@Param('id', ParseIntPipe) id: number, @View() view: EdgeView) {
    const document = await DocumentEntity.findOne({
      where: { id },
      relations: {
        category: true,
      },
    });
    if (!document) {
      throw new NotFoundException('문서를 찾을 수 없습니다.');
    }
    return await view.render('pages/documents/edit', { document });
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
    return res.redirect(303, '/documents');
  }

  @Delete(':id')
  async destroy(
    @Param('id', ParseIntPipe) id: number,
    @View() view: EdgeView,
    @Res() res: Response,
  ) {
    await this.documentsService.destroy(id);
    view.setFlash('notice', '게시물이 삭제되었습니다.');
    return res.redirect(303, '/documents');
  }
}
