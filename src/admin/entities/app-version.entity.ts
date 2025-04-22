import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum PlatformTypes {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

@Entity({ comment: '앱버전', name: 'PLUG_CO0002' })
export class AppVersionEntity {
  @PrimaryColumn({ comment: '플랫폼ID', name: 'PLTM_ID' })
  readonly type: PlatformTypes;

  @PrimaryColumn({ comment: '버전번호', name: 'VER_NO' })
  readonly version: string;

  @Column({ comment: '강제업데이트유무', name: 'VRFY_YN' })
  readonly validYn: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;
}
