import { MessageEmbed } from 'discord.js';
import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Channel as EntityChannel, Embed, Guild as EntityGuild, Reaction, ReactionRole } from '../../entity';
import { ConnectionClient, ConnectionCommand } from '../../lib/common/classes';
import { getGuild } from '../../lib/utils/guild/getGuild';

interface GuildObjectValues {
  guild: string;
  channels: string;
  embeds: string;
  reactions: string;
  roles: string;
}

const getGuildFromOwner = (client: CommandoClient, message: CommandoMessage) => {
  const i = message.content.indexOf(' ');
  if (i != -1) {
    const property = message.content.substring(i + 1);
    const guild = getGuild(property, client);
    return guild != null ? guild : message.guild;
  }
  return message.guild;
};

const getGuildValues = (g: EntityGuild, message: CommandoMessage) => {
  const values: GuildObjectValues = {
    guild: g.getGuild(message.client).toString(),
    channels: (<EntityChannel[]>g.channels).map((c) => c.getChannel(message.guild).toString()).join('\n'),
    embeds: (<Embed[]>g.embeds).map((e) => e.getValue()).join('\n'),
    reactions: (<Reaction[]>g.reactions).map((r) => r.getValue(message.guild)).join('\n'),
    roles: (<ReactionRole[]>g.roles).map((r) => r.getRole(message.guild)).join('\n'),
  };

  return values;
};

const noEntries = 'No Entries';

export default class viewGuild extends ConnectionCommand {
  constructor(client: ConnectionClient) {
    super(client, {
      name: 'viewguild',
      aliases: ['viewg', 'vg'],
      memberName: 'viewguild',
      group: 'database',
      description:
        'View the database entries for the guild. The bot owner may also specify any guild from the database.',
    });
  }

  async run(message: CommandoMessage) {
    const guild = this.client.owners.includes(message.author) ? getGuildFromOwner(this.client, message) : message.guild;

    const queryGuild = await this.client.conn
      .getRepository(EntityGuild)
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.channels', 'channel')
      .leftJoinAndSelect('g.embeds', 'embed')
      .leftJoinAndSelect('g.reactions', 'reaction')
      .leftJoinAndSelect('g.roles', 'role')
      .where('g.id = :id', { id: guild.id })
      .getOne();

    if (queryGuild == undefined) {
      message.reply(`${guild} was not found in the database. Try registering it with the command \`+registerguild\``);
      return null;
    }

    const values = getGuildValues(queryGuild, message);
    const embed = new MessageEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setTitle(`Database Entries`)
      .setThumbnail(guild.iconURL() as string)
      .addFields([
        {
          name: 'Guild',
          value: values.guild,
        },
        {
          name: 'Channels',
          value: values.channels || noEntries,
        },
        {
          name: 'Embed Messages',
          value: values.embeds || noEntries,
        },
        {
          name: 'Reactions',
          value: values.reactions || noEntries,
        },
        {
          name: 'Roles',
          value: values.roles || noEntries,
        },
      ]);

    message.embed(embed);
    return null;
  }
}
