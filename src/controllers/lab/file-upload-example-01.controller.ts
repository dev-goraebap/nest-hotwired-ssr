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

import { EdgeJsView, View } from 'src/shared/edge-js';
import { ActiveStorageService } from 'src/shared/typeorm-active-storage';

@Controller({ path: 'lab/file-upload-example-01' })
export class FileUploadExampleController {
  constructor(private readonly activeStorage: ActiveStorageService) {}

  @Get()
  async index(@View() view: EdgeJsView, @Res() res: Response) {
    const attachments = await this.activeStorage.findAttachmentsByRecord(
      'file-upload-test-01',
      '0000',
      'file',
    );

    const template = await view.render(
      'page::lab/file-upload-example-01/index',
      { attachments },
    );
    return res.send(template);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @View() view: EdgeJsView,
    @Res() res: Response,
  ) {
    if (!file) {
      view.setFlash('alert', '파일을 선택해주세요.');
      return res.redirect('/lab/file-upload-example-01');
    }
    
    try {
      // Active Storage를 사용하여 파일 첨부
      const attachment = await this.activeStorage.attach(
        file, // 업로드된 파일
        'file-upload-test-01', // recordType
        '0000', // recordId (예시용 고정값)
        'file', // name
      );

      console.log('파일 업로드 성공:', {
        attachmentId: attachment.id,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });

      view.setFlash(
        'notice',
        `파일 "${file.originalname}"이 성공적으로 업로드되었습니다!`,
      );
      return res.redirect('/lab/file-upload-example-01');
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      view.setFlash('alert', '파일 업로드 중 오류가 발생했습니다.');
      return res.redirect('/lab/file-upload-example-01');
    }
  }
}
