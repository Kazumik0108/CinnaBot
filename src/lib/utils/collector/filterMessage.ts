import { Message } from 'discord.js';
import { EMOJI } from '../../common/regex';

export const messageFilterEmoji = (msg: Message) => {
  const emoji = msg.content.match(EMOJI);
  return emoji != null ? true : false;
};

export const messageFilterArgs = (message: Message, target: Message, args: string[]) => {
  const parse = target.content.split(/ +/);
  const arg = parse.slice(0, 1).join('').toLowerCase();
  return message.author == target.author && args.includes(arg) ? true : false;
};
