import { Controller, Get } from '@nestjs/common';

@Controller({ path: 'posts' })
export class PostsController {
  @Get()
  index() {
    return '';
  }
}
