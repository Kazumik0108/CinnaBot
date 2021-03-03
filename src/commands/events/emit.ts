import { stripIndents } from 'common-tags';
import { Guild, GuildEmoji, GuildMember } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { ClientEvents } from '../../types';

interface promptArgs {
  event: string;
}

const clientEventsArray = () => {
  const events = Object.keys(ClientEvents);
  const columnOne = events.slice(0, Math.ceil(events.length / 2));
  const columnTwo = events.slice(Math.ceil(events.length / 2), events.length);

  const width = 30;
  const table = [];
  for (const i in columnOne) {
    let line = columnOne[i].padEnd(width, ' ');
    if (columnTwo[i]) line = line.concat(`| ${columnTwo[i]}`);
    table.push(line);
  }

  return table.join('\n');
};

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
          prompt: stripIndents`
            Enter an event to emit in this server. The list of client events are shown below.\`\`\`${clientEventsArray()}\`\`\``,
          type: 'string',
          validate: (event: string) => event in ClientEvents,
        },
      ],
    });
  }

  async run(message: CommandoMessage, { event }: promptArgs): Promise<null> {
    switch (event) {
      case ClientEvents.emojiCreate: {
        const emojiCreate = new GuildEmoji(message.client, { name: event }, message.guild as Guild);
        message.client.emit(event, emojiCreate);
        break;
      }
      case ClientEvents.emojiDelete: {
        const emojiDelete = new GuildEmoji(message.client, { name: event }, message.guild as Guild);
        message.client.emit(event, emojiDelete);
        break;
      }
      case ClientEvents.emojiUpdate: {
        const emojiOld = new GuildEmoji(message.client, { name: event + 'old' }, message.guild as Guild);
        const emojiNew = new GuildEmoji(message.client, { name: event + 'new' }, message.guild as Guild);
        message.client.emit(event, emojiOld, emojiNew);
        break;
      }
      case ClientEvents.guildMemberAdd: {
        message.client.emit(event, message.member as GuildMember);
        break;
      }
      default: {
        message.say(`No callback has been added for the event \`${event}\`.`);
      }
    }
    return null;
  }
}
