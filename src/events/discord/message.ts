import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { handleNonNitroEmoji } from '../../handlers/message/handleNonNitroEmoji';

export default async (client: CommandoClient, message: CommandoMessage) => {
  if (message.author.bot) return;
  if (message.channel.type == 'text') await handleNonNitroEmoji(client, message);
};
