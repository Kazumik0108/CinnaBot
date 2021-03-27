import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Base extends BaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  id!: string;

  @Column()
  name!: string;
}
