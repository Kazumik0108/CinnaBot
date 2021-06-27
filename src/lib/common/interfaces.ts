import {
  ColorResolvable,
  EmojiIdentifierResolvable,
  Guild,
  GuildEmoji,
  Message,
  MessageEmbed,
  MessageReaction,
  Role,
  RoleData,
  TextChannel,
  User
} from 'discord.js';
import { CommandoClientOptions } from 'discord.js-commando';
import { Connection } from 'typeorm';
import { IgnoreRelation } from './types';

export interface ConnectionClientOptions extends CommandoClientOptions {
  conn: Connection;
}

export interface RoleDataArgs {
  default: boolean;
  color?: ColorResolvable;
  hoist?: boolean;
  position?: number;
  permAdd?: string[];
  permDel?: string[];
}

export interface RoleDataEmbedInputs {
  message: Message;
  roleData: RoleData;
  role?: Role;
}

export interface RoleDataConfirmationOptions {
  message: Message;
  options: RoleDataEmbedInputs;
  target: Message;
  type: 'add' | 'update' | 'delete';
}

export interface ReactionOptionsYesNo {
  yes: EmojiIdentifierResolvable;
  no: EmojiIdentifierResolvable;
  edit?: EmojiIdentifierResolvable;
  help?: EmojiIdentifierResolvable;
}

export interface ReactionOptionsBackNext {
  first?: EmojiIdentifierResolvable;
  back: EmojiIdentifierResolvable;
  next: EmojiIdentifierResolvable;
  last?: EmojiIdentifierResolvable;
}

export interface ReactionCallbacksYesNo {
  yes(): Promise<void>;
  no(): Promise<void>;
  edit?(): Promise<void>;
  help?(): Promise<void>;
}

export interface ReactionFilterAny {
  message: Message;
  reaction: MessageReaction;
  user: User;
}

export interface ReactionFilterOptions extends ReactionFilterAny {
  options: ReactionOptionsBackNext | ReactionOptionsYesNo;
}

export interface ColorConvertOptions {
  input: string;
  option: 'decToHex' | 'hexToDec';
}

export interface GuildViewArgs {
  guild: string;
  channels: string;
  embeds: string;
  reactions: string;
  roles: string;
}

export interface GuildViewOptions {
  description?: string;
  ignore?: IgnoreRelation[];
}

export interface BindChannel {
  readonly type: 'channel';
  args: { channel: TextChannel };
}

export interface BindEmbed {
  readonly type: 'embed';
  args: { uuid: string; guild: Guild; channel?: TextChannel };
}

export interface BindReaction {
  readonly type: 'reaction';
  args: { reaction: GuildEmoji; role?: Role; embed?: MessageEmbed };
}

export interface BindRole {
  readonly type: 'role';
  args: { role: Role; embed?: MessageEmbed };
}
