import { TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { handleGuildEmbed } from '../../handlers/server/handleGuildEmbed';
import { CHANNEL_ID } from '../../lib/common/regex';
import { getGuildChannel } from '../../lib/utils/guild/channel';

export default class embedPreFormatted extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'embed',
      group: 'server',
      memberName: 'embed',
      description: 'Send a pre-formatted embed message to the channel',
      examples: ['+embed'],
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['MANAGE_CHANNELS'],
      args: [
        {
          key: 'channel',
          prompt: 'Mention the target channel for the embed message.',
          type: 'string',
          validate: (mention: string, msg: CommandoMessage) => {
            if (!CHANNEL_ID.test(mention)) return false;
            const id = (mention.match(CHANNEL_ID) as string[])[0];

            const channel = <TextChannel | null>getGuildChannel(id, msg.guild);
            return channel != null ? true : false;
          },
          parse: (mention: string, msg: CommandoMessage) => {
            const id = (mention.match(CHANNEL_ID) as string[])[0];
            const channel = <TextChannel>getGuildChannel(id, msg.guild);
            return channel;
          },
        },
      ],
    });
  }

  async run(message: CommandoMessage) {
    await handleGuildEmbed(message);
    return null;
  }
}
