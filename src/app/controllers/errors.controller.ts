import { Controller, Get } from '@nestjs/common';
import { EdgeView, View } from 'src/shared/edge-in-nest';

@Controller({ path: '' })
export class ErrorsController {
  @Get('404')
  page404(@View() view: EdgeView) {
    return view.render('pages/errors/404');
  }

  @Get('403')
  page403(@View() view: EdgeView) {
    return view.render('pages/errors/403');
  }

  @Get('500')
  page500(@View() view: EdgeView) {
    return view.render('pages/errors/500');
  }
}
