import { Module } from '@nestjs/common';

import { PublicDocumentsModule } from './documents/documents.module';
import { PublicHomeModule } from './home/home.module';
import { PublicSessionsModule } from './sessions/sessions.module';

@Module({
  imports: [PublicHomeModule, PublicDocumentsModule, PublicSessionsModule],
})
export class PublicModule {}
