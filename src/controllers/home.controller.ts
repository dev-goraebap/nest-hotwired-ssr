import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";

@Controller({ path: '' })
export class HomeController {

  @Get()
  index(@Res() res: Response, @Query('message') message?: string) {
    // http://localhost:3000/?message=<script>alert('XSS 공격 성공!');</script>
    return res.render('home/index', {
      message: message || 'Hello world'
    });
  }
}