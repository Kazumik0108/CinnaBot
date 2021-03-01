import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { handleEmojiListCollector } from '../../handlers/emoji/handleEmojiListCollector';
import { handleEmojiListGuild } from '../../handlers/emoji/handleEmojiListGuild';

interface promptArgs {
  index: string;
}

export default class serverEmoteList extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'emotelist',
      group: 'emote',
      memberName: 'emotelist',
      description:
        'Sends the list of emotes from a server. The author can only show emotes from servers they share with the client. Send `0` to show the list of emotes in the current server.',
      examples: ['+emotelist', '+emotelist 0'],
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['MANAGE_EMOJIS', 'MANAGE_MESSAGES'],
      throttling: {
        usages: 5,
        duration: 20,
      },
      args: [
        {
          key: 'index',
          prompt: 'Specify `0` to send the emote list of this server. Otherwise, specify `1`.',
          type: 'string',
          validate: (value: string) => {
            return ['0', '1'].includes(value) ? true : false;
          },
        },
      ],
    });
  }

  async run(message: CommandoMessage, { index }: promptArgs) {
    if (index == '0') {
      await handleEmojiListGuild(message, message.guild);
      return null;
    }

    await handleEmojiListCollector(message);
    return null;
  }
}
