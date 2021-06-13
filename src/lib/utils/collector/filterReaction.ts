import { Message, MessageReaction, User } from 'discord.js';
import { ReactionOptionsBackNext, ReactionOptionsYesNo } from '../../common/interfaces';

export const reactionFilter = (
  message: Message,
  reaction: MessageReaction,
  user: User,
  options?: ReactionOptionsYesNo | ReactionOptionsBackNext,
) => {
  if (options == undefined) {
    const emoji = message.client.emojis.cache.find((e) => e.name == reaction.emoji.name);
    return user.id == message.author.id && emoji != undefined;
  }

  const reactions = <string[]>Object.values(options);
  return user.id == message.author.id && reactions.includes(reaction.emoji.name);
};
