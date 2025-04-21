import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './temp/development.sqlite',
      synchronize: true,
      logging: true,
      autoLoadEntities: true,
    })
  ],
})
export class DatabaseModule {}