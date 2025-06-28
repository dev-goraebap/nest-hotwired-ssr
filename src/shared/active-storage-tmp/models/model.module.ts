import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AttachmentEntity } from "./attachment.entity";
import { BlobEntity } from "./blob.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlobEntity,
      AttachmentEntity
    ])
  ],
  exports: [TypeOrmModule]
})
export class ModelModule {}