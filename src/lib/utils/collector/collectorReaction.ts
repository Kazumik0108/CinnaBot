import { Message, MessageReaction, ReactionCollector, User } from 'discord.js';
import { ReactionCallbacksYesNo, ReactionOptionsYesNo } from '../../common/interfaces';
import { reactionFilter } from './filterReaction';

export const createReactionCollector = async (message: Message, target: Message, options: ReactionOptionsYesNo) => {
  for (const option of Object.values(options) as string[]) {
    await target.react(option);
  }

  const filter = (react: MessageReaction, user: User) => reactionFilter(message, react, user, options);
  const collector = target.createReactionCollector(filter, { time: 15 * 1000 });
  return collector;
};

export const createReactionOnCollect = async (
  collector: ReactionCollector,
  options: ReactionOptionsYesNo,
  callbacks: ReactionCallbacksYesNo,
) => {
  collector.on('collect', async (react: MessageReaction) => {
    switch (react.emoji.name) {
      case options.yes:
        await callbacks.yes();
        return;
      case options.no:
        await callbacks.no();
        return;
      default:
        return;
    }
  });
};
