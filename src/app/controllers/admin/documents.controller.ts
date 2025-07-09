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
  View
} from 'nestjs-mvc-tools';

import { DocumentsService } from 'src/app/services/documents.service';

@Controller({ path: 'admin/documents' })
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async index(@View() view: NestMvcView) {
    const documents = await this.documentsService.index();
    return view.render('pages/admin/documents/index', { documents });
  }

  @Get('new')
  async new(@View() view: NestMvcView) {
    return view.render('pages/admin/documents/new');
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number, @View() view: NestMvcView) {
    const document = await this.documentsService.getById(id);
    return view.render('pages/admin/documents/show', { document });
  }

  @Post()
  async create(@Req() req: NestMvcReq, @Res() res: Response) {
    await this.documentsService.create(req.body?.document);
    req.flash.success('작업 성공');
    return res.redirect('/admin/documents');
  }

  @Get(':id/edit')
  async edit(@Param('id', ParseIntPipe) id: number, @View() view: NestMvcView) {
    const document = await this.documentsService.getById(id);
    return view.render('pages/admin/documents/edit', { document });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: NestMvcReq,
    @Res() res: Response,
  ) {
    await this.documentsService.update(id, req.body?.document);
    req.flash.success('작업 성공');
    return res.redirect(303, '/admin/documents');
  }

  @Delete(':id')
  async destroy(
    @Param('id', ParseIntPipe) id: number,
    @Flash() flash: NestMvcFlash,
    @Res() res: Response,
  ) {
    await this.documentsService.destroy(id);
    flash.success('삭제 성공');
    return res.redirect(303, '/admin/documents');
  }
}
