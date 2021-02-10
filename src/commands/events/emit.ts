// emit.ts
import { Guild, GuildEmoji, GuildMember } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import events from '../../info/clientevents.json';

interface promptArgs {
  event: string;
}

export default class emit extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'emit',
      group: 'events',
      memberName: 'emit',
      description: 'Emit an event to the messaged server.',
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['MANAGE_CHANNELS'],
      args: [
        {
          key: 'event',
          prompt:
            'Enter an event to emit in this server. The list of client events are shown below.\n' +
            '```\n' +
            events.join('\n') +
            '```',
          type: 'string',
          oneOf: [...events, 'cancel'],
        },
      ],
    });
  }

  async run(message: CommandoMessage, { event }: promptArgs): Promise<null> {
    switch (event.toLocaleLowerCase()) {
      // channel events

      // debug

      // emoji events
      case 'emojicreate': {
        const emojiCreate = new GuildEmoji(message.client, { name: 'create' }, message.guild as Guild);
        message.client.emit('emojiCreate', emojiCreate);
        break;
      }

      case 'emojidelete': {
        const emojiDelete = new GuildEmoji(message.client, { name: 'delete' }, message.guild as Guild);
        message.client.emit('emojiDelete', emojiDelete);
        break;
      }

      case 'emojiupdate': {
        const emojiOld = new GuildEmoji(message.client, { name: 'old' }, message.guild as Guild);
        const emojiNew = new GuildEmoji(message.client, { name: 'new' }, message.guild as Guild);
        message.client.emit('emojiUpdate', emojiOld, emojiNew);
        break;
      }

      // error

      // guild events
      case 'guildmemberadd': {
        message.client.emit('guildMemberAdd', message.member as GuildMember);
        break;
      }

      // invalidated

      // invite events

      // message events

      // presenceupdate

      // ratelimit

      // ready

      // role events

      // shard events

      // typingstart

      // voicestateupdate

      // warn

      // webhookupdate

      // properties
    }

    return null;
  }
}
