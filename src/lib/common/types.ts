import { GuildRelations } from './enums';

export type IgnoreRelation =
  | GuildRelations.channel
  | GuildRelations.embed
  | GuildRelations.reaction
  | GuildRelations.role;
