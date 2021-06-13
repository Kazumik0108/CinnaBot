import { Message } from 'discord.js';
import { messageFilterArgs } from './filterMessage';

export const createMessageCollector = (message: Message, args: string[]) => {
  const filter = (msg: Message) => messageFilterArgs(message, msg, args);
  const collector = message.channel.createMessageCollector(filter, { time: 30 * 1000 });
  return collector;
};
