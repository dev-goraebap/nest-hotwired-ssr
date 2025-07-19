import { ConfigModuleOptions } from '@nestjs/config';
import { join } from 'path';

export const configOptions: ConfigModuleOptions<Record<string, any>> = {
  envFilePath: join(process.cwd(), `.env.${process.env.NODE_ENV}.local`),
  isGlobal: true,
};
