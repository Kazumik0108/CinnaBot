import { Message } from 'discord.js';
import { MessageFilterOptions } from '../../common/interfaces';
import { EMOJI } from '../../common/regex';

export const messageEmojiFilter = (msg: Message) => {
  const emoji = msg.content.match(EMOJI);
  return emoji != null ? true : false;
};

export const messageOptionsFilter = ({ args, message }: MessageFilterOptions) => {
  const parse = message.content.split(/ +/);
  const arg = parse.slice(0, 1).join('').toLowerCase();
  return args.includes(arg) ? true : false;
};
