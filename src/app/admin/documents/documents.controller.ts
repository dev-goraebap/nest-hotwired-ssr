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
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import {
  Flash,
  NestMvcFlash,
  NestMvcReq,
  NestMvcView,
  View,
} from 'nestjs-mvc-tools';
import { ZodValidationPipe } from 'src/common/pipes/zod.pipe';

import { AuthGuard } from 'src/common/guards/auth.guard';

import { AdminDocumentsService } from './documents.service';
import {
  CreateDocumentDto,
  CreateDocumentSchema,
} from './dto/create-document.dto';
import { CreateDocumentUseCase } from './use-cases/create-document.use-case';
import { UpdateDocumentUseCase } from './use-cases/update-document.use-case';

@Controller({ path: 'admin/documents' })
@UseGuards(AuthGuard)
export class AdminDocumentsController {
  constructor(
    private readonly documentsService: AdminDocumentsService,
    private readonly createDocumentUseCase: CreateDocumentUseCase,
    private readonly updateDocumentUseCase: UpdateDocumentUseCase,
  ) {}

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
  @UsePipes(new ZodValidationPipe(CreateDocumentSchema))
  async create(
    @Body() dto: CreateDocumentDto,
    @Flash() flash: NestMvcFlash,
    @Res() res: Response,
  ) {
    console.log(dto);
    // await this.createDocumentUseCase.execute(dto);
    flash.success('작업 성공');
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
    await this.updateDocumentUseCase.execute(id, req.body?.document);
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
