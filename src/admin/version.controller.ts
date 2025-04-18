import { Controller, Get, Render } from '@nestjs/common';

@Controller({ path: 'admin/versions' })
export class VersionController {

  @Get()
  @Render('versions/index')
  async index() { }
}
