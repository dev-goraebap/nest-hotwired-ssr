import { Body, Controller, Get, Param, Post, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { IpWhitelistService } from '../services/ip-whitelist.service';

@Controller({ path: 'admin/whitelist' })
export class IpWhitelistController {

  constructor(
    private readonly ipWhitelistService: IpWhitelistService,
  ) {}

  @Get()
  @Render('ip-whitelist/index')
  async index() {
    const result = await this.ipWhitelistService.findAll();
    return { result, ipList: result.data || [] };
  }

  @Get('new')
  @Render('ip-whitelist/new')
  async new() {
    return { error: null };
  }

  @Post()
  async create(@Body() body: { ip: string, description?: string }, @Res() res: Response) {
    const { ip, description } = body;
    const result = await this.ipWhitelistService.create(ip, description);
    
    if (result.success) {
      return res.redirect('/admin/whitelist');
    } else {
      return res.render('ip-whitelist/new', { 
        error: result.firstMessage,
        ipData: { ip, description }
      });
    }
  }

  @Post('delete/:ip')
  async destroy(@Param('ip') ip: string, @Res() res: Response) {
    await this.ipWhitelistService.delete(ip);
    return res.redirect('/admin/whitelist');
  }
}