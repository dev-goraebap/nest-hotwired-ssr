import { Controller, Get } from '@nestjs/common';
import { EdgeView, View } from 'nestjs-mvc-tools';
import { Lang } from '../decorators/lang';

@Controller()
export class HomeController {
  @Get()
  index(@View() view: EdgeView, @Lang() lang: string) {
    return view.render('pages/home', {});
  }
}
