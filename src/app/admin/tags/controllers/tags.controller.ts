import { Controller, Get, Query } from '@nestjs/common';
import { NestMvcView, View } from 'nestjs-mvc-tools';

import { TagsService } from '../services/tags.service';

@Controller({ path: 'admin/tags' })
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get('search')
  async search(@View() view: NestMvcView, @Query('keyword') keyword: string) {
    if (!keyword || keyword.length < 2) {
      return view.render('pages/admin/tags/_search_turbo_frame', { tags: [] });
    }
    const tags = await this.tagsService.search(keyword);
    return view.render('pages/admin/tags/_search_turbo_frame', { tags });
  }
}
