import { Message, MessageReaction, User } from 'discord.js';

export interface MessageFilterOptions {
  args: string[];
}

export const messageFilter = (options: MessageFilterOptions, collectMessage: Message): boolean => {
  const parse = collectMessage.content.split(/ +/);
  const arg = parse.slice(0, 1).join('').toLowerCase();
  return options.args.includes(arg) ? true : false;
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
  message: Message,
  options: ReactionOptionsYesNo | ReactionOptionsBackNext,
  collectReaction: MessageReaction,
  collectReactionUser: User,
): boolean => {
  const reactions: string[] = Object.values(options);
  return reactions.includes(collectReaction.emoji.name) && collectReactionUser.id === message.author.id;
};
