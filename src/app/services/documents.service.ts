import { MvcNotFoundException } from 'nestjs-mvc-tools';
import { DocumentEntity } from '../entities/document.entity';

export class DocumentsService {
  async getBySlug(slug: string, lang = 'ko') {
    const result = await DocumentEntity.findOne({
      where: {
        slug,
        translations: {
          languageCode: lang,
        },
      },
      relations: {
        translations: true,
      },
    });
    if (!result) {
      throw new MvcNotFoundException('게시물을 찾을 수 없습니다.');
    }
    return result;
  }
}
