import { Controller, Get } from '@nestjs/common';
import { EdgeView, View } from 'nestjs-mvc-tools';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@View() view: EdgeView) {
    const message = this.appService.getHello();
    return view.render("pages/hello_world/index", { message });
  }
}
