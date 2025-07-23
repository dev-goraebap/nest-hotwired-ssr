import { Body, Controller, Post } from '@nestjs/common';
import { TagsService } from '../services/tags.service';

@Controller({ path: 'api/admin/tags' })
export class TagsApiController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async create(@Body('name') name: string) {
    return await this.tagsService.create(name);
  }
}
