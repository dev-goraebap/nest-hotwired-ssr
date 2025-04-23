import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'ip_whitelist' })
export class IpWhitelistEntity {
  @PrimaryColumn({ comment: 'IP 주소' })
  readonly ip: string;

  @Column({ comment: 'IP 주소 설명', nullable: true })
  readonly description: string;

  @CreateDateColumn({ comment: '생성일' })
  readonly createdAt: Date;

  @UpdateDateColumn({ comment: '수정일', nullable: true })
  readonly updatedAt: Date;
}