import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { handleGuildEmbed } from '../../handlers/server/handleGuildEmbed';

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
    });
  }

  async run(message: CommandoMessage) {
    await handleGuildEmbed(message);
    return null;
  }
}
