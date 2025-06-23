import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";

@Controller({ path: '' })
export class HomeController {

  @Get()
  index(@Res() res: Response) {
    return res.render('home/index', {
      message: 'Hello world'
    });
  }
}