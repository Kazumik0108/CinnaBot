import { ColorResolvable, Message, MessageReaction, User } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';

export interface RoleDataArgs {
  default: boolean;
  color?: ColorResolvable;
  hoist?: boolean;
  position?: number;
  permAdd?: string[];
  permDel?: string[];
}

export interface RoleDataConfirmationOptions {
  options: RoleDataEmbedInputs;
  watch: Message | CommandoMessage;
  type: 'add' | 'update' | 'delete';
}

export interface GetGuildRoleOptions {
  property: string;
  message: Message | CommandoMessage;
}

export interface MessageFilterOptions {
  args: string[];
  message: Message | CommandoMessage;
}

export interface ReactionOptionsYesNo {
  yes: string;
  no: string;
  edit?: string;
  help?: string;
}

export interface ReactionOptionsBackNext {
  first?: string;
  back: string;
  next: string;
  last?: string;
}

export interface ReactionFilterAny {
  message: Message | CommandoMessage;
  reaction: MessageReaction;
  user: User;
}

export interface ReactionFilterOptions extends ReactionFilterAny {
  options: ReactionOptionsBackNext | ReactionOptionsYesNo;
}
