import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'base' })
export class Base extends BaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  id!: string;

  @Column()
  name!: string;
}
