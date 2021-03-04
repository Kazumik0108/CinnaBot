import { ReactionFilterAny, ReactionFilterOptions } from '../../types/common/interfaces';

export const reactionAnyFilter = ({ message, reaction, user }: ReactionFilterAny) => {
  const emoji = message.client.emojis.cache.find((e) => e.name == reaction.emoji.name);
  return user.id == message.author.id && emoji != undefined;
};

export const reactionOptionsFilter = ({ message, reaction, user, options }: ReactionFilterOptions) => {
  const reactions: string[] = Object.values(options);
  return user.id == message.author.id && reactions.includes(reaction.emoji.name);
};
