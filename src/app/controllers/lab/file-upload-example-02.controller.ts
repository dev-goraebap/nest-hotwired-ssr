import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { DocumentsService } from 'src/app/services/documents.service';
import { EdgeView, View } from 'src/shared/edge-in-nest';
import { GoogleVisionService } from 'src/shared/google-vision';
import { ActiveStorageService } from 'src/shared/typeorm-active-storage';

@Controller({ path: 'lab/file-upload-example-02' })
export class FileUploadExample02Controller {
  constructor(
    private readonly googleVision: GoogleVisionService,
    private readonly activeStorage: ActiveStorageService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Get()
  async index(@View() view: EdgeView) {
    const document = await this.documentsService.getBySlug(
      'lab/file-upload-example-02',
    );
    const attachments = await this.activeStorage.findAttachmentsByRecord(
      'file-upload-example-02',
      '0000',
      'image',
    );
    return await view.render('pages/lab/file-upload-example-02/index', {
      attachments,
      document,
    });
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @View() view: EdgeView,
    @Res() res: Response,
  ) {
    const result = await this.googleVision.extractColors(file.buffer);
    const dominantColor = result[0]?.hex;
    const attachment = await this.activeStorage.attach(
      file,
      'file-upload-example-02',
      '0000',
      'image',
      'append',
    );
    await this.activeStorage.updateBlobMetadata(attachment.blob, {
      dominantColor,
    });
    view.setFlash('notice', '이미지 업로드 성공');
    return res.redirect('/lab/file-upload-example-02');
  }
}
