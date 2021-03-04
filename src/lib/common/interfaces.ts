import { ColorResolvable, EmojiIdentifierResolvable, Message, MessageReaction, Role, RoleData, User } from 'discord.js';

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

export interface MessageFilterOptions {
  args: string[];
  message: Message;
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
