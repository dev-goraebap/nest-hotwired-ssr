import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Render,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';
import { extname } from 'path';
import { DynamicContentService } from '../services/dynamic-content.service';

@Controller({ path: 'admin/dynamic-content' })
export class DynamicContentController {
  constructor(private readonly dynamicContentService: DynamicContentService) {}

  private static getFileOptions() {
    return {
      storage: diskStorage({
        destination: './resources/public/imgs',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(
            null,
            `dynamic-content-${randomName}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('이미지 파일만 업로드할 수 있습니다.'), false);
        }
        cb(null, true);
      },
    };
  }

  @Get()
  @Render('dynamic-content/index')
  async index() {
    const mainContents =
      await this.dynamicContentService.getContentsByScreenType('main');
    const detailContents =
      await this.dynamicContentService.getContentsByScreenType('detail');

    return {
      mainContents,
      detailContents,
    };
  }

  @Get('new')
  @Render('dynamic-content/new')
  async new() {
    return {
      formData: {},
    };
  }

  @Post()
  async create(@Body() createDto: any, @Res() res: Response) {
    try {
      const result = await this.dynamicContentService.create({
        screenType: createDto.screenType,
        contentType: createDto.contentType,
        content: createDto.content,
      });

      if (result.failure) {
        return res.render('dynamic-content/new', {
          formData: createDto,
          error: result.fullMessages.join('<br>'),
        });
      }

      return res.redirect('/admin/dynamic-content');
    } catch (error) {
      return res.render('dynamic-content/new', {
        formData: createDto,
        error: `컨텐츠 저장 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  }

  @Get('edit/:id')
  @Render('dynamic-content/edit')
  async edit(@Param('id') id: string, @Res() res: Response) {
    const content = await this.dynamicContentService.getById(id);

    if (!content) {
      return res.redirect('/admin/dynamic-content');
    }

    return {
      formData: content,
      contentId: id,
      error: null,
    };
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Res() res: Response,
  ) {
    try {
      const result = await this.dynamicContentService.update(id, {
        screenType: updateDto.screenType,
        contentType: updateDto.contentType,
        content: updateDto.content,
      });

      if (result.failure) {
        return res.render('dynamic-content/edit', {
          formData: { ...updateDto, id },
          contentId: id,
          error: result.fullMessages.join('<br>'),
        });
      }

      return res.redirect('/admin/dynamic-content');
    } catch (error) {
      return res.render('dynamic-content/edit', {
        formData: { ...updateDto, id },
        contentId: id,
        error: `컨텐츠 수정 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  }

  @Post('upload-images')
  @UseInterceptors(
    FilesInterceptor('images', 10, DynamicContentController.getFileOptions()),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return {
        success: false,
        message: '이미지를 하나 이상 선택해주세요.',
      };
    }

    const uploadedImages = files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      path: `/public/imgs/${file.filename}`,
      size: file.size,
    }));

    return {
      success: true,
      message: '이미지가 성공적으로 업로드되었습니다.',
      images: uploadedImages,
    };
  }

  @Delete('delete-image/:filename')
  @HttpCode(200)
  async deleteImage(@Param('filename') filename: string) {
    try {
      const filePath = path.join('./resources/public/imgs', filename);

      // 파일이 존재하는지 확인
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return {
          success: true,
          message: '이미지가 성공적으로 삭제되었습니다.',
        };
      }

      return {
        success: false,
        message: '파일을 찾을 수 없습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: `이미지 삭제 중 오류가 발생했습니다: ${error.message}`,
      };
    }
  }

  @Post('change-use/:id')
  async changeUseStatus(@Param('id') id: string, @Res() res: Response) {
    const result = await this.dynamicContentService.changeUseStatus(id);

    if (result.failure) {
      return res.status(400).json({
        success: false,
        message: result.firstMessage,
      });
    }

    return res.json({
      success: true,
      message: '컨텐츠 상태가 변경되었습니다.',
    });
  }

  @Post('delete/:id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    try {
      // 서비스에 삭제 기능이 없으므로 먼저 추가해야 함
      const deleteResult = await this.dynamicContentService.delete(id);

      if (deleteResult.failure) {
        return res.status(400).json({
          success: false,
          message: deleteResult.firstMessage,
        });
      }

      return res.json({
        success: true,
        message: '컨텐츠가 성공적으로 삭제되었습니다.',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `컨텐츠 삭제 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  }
}
