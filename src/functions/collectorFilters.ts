import { Message, MessageReaction, User } from 'discord.js';

export interface MessageFilterOptions {
  args: string[];
}

export const messageFilter = (opt: MessageFilterOptions, msg: Message): boolean => {
  const parse = msg.content.split(/ +/);
  const arg = parse.slice(0, 1).join('').toLowerCase();
  return opt.args.includes(arg) ? true : false;
};

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

export const reactionFilter = (
  msg: Message,
  opt: ReactionOptionsYesNo | ReactionOptionsBackNext,
  react: MessageReaction,
  user: User,
): boolean => {
  const reactions: string[] = Object.values(opt);
  return user.id === msg.author.id && reactions.includes(react.emoji.name);
};
