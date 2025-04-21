import { Controller, Get, Render } from '@nestjs/common';

@Controller({ path: 'admin/dr-notices' })
export class DrNoticeController {

  @Get()
  @Render('dr-notices/index')
  async index() { }
}
