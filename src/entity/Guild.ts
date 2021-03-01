import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'guilds' })
export class Guild {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column()
  guildID!: string;

  @Column()
  guildName!: string;
}
