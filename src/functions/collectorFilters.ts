import { Message, MessageReaction, User } from 'discord.js';

import { EMOJI_REGEX } from './regexFilters';

export interface MessageOptions {
  args: string[];
}

export const messageEmojiFilter = (msg: Message, message: Message) => {
  const emoji = msg.content.match(EMOJI_REGEX);
  return emoji != null ? true : false;
};

export const messageOptionsFilter = (opt: MessageOptions, msg: Message): boolean => {
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

export const reactionAnyFilter = (msg: Message, react: MessageReaction, user: User) => {
  const emoji = msg.client.emojis.cache.find((e) => e.name == react.emoji.name);
  return user.id == msg.author.id && emoji != undefined;
};

export const reactionOptionsFilter = (
  msg: Message,
  opt: ReactionOptionsYesNo | ReactionOptionsBackNext,
  react: MessageReaction,
  user: User,
) => {
  const reactions: string[] = Object.values(opt);
  return user.id == msg.author.id && reactions.includes(react.emoji.name);
};
