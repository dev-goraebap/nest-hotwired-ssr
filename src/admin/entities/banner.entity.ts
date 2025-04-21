import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

enum BannerActionType {
  LINK = 'LINK',
  DR = 'DR',
  PLUS_DR = 'PLUS_DR',
  GUIDE = 'GUIDE',
}

@Entity({ name: 'banners' })
export class BannerEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  readonly actionType: BannerActionType;

  @Column({ nullable: true })
  readonly actionUrl?: string;

  @Column()
  readonly imageUrl: string;

  @Column()
  readonly displayOrder: number;
}
