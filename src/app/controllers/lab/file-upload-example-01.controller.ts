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

import { EdgeView, View } from 'src/shared/edge-in-nest';
import { ActiveStorageService } from 'src/shared/typeorm-active-storage';

@Controller({ path: 'lab/file-upload-example-01' })
export class FileUploadExample01Controller {
  constructor(private readonly activeStorage: ActiveStorageService) {}

  @Get()
  async index(@View() view: EdgeView, @Res() res: Response) {
    // 업로드된 파일 목록 조회 (이제 실제 모델 인스턴스 반환)
    const attachments = await this.activeStorage.findAttachmentsByRecord(
      'file-upload-test-01',
      '0000',
      'file',
    );

    const template = await view.render(
      'pages::lab/file-upload-example-01/index',
      { attachments },
    );
    return res.send(template);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @View() view: EdgeView,
    @Res() res: Response,
  ) {
    try {
      if (!file) {
        view.setFlash('alert', '파일을 선택해주세요.');
        return res.redirect('/lab/file-upload-example-01');
      }

      // Active Storage를 사용하여 파일 첨부
      const attachment = await this.activeStorage.attach(
        file, // 업로드된 파일
        'file-upload-test-01', // recordType
        '0000', // recordId (예시용 고정값)
        'file', // name
        'append'
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
