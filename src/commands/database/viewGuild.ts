import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Channel as EntityChannel, Embed, Guild as EntityGuild, Reaction, ReactionRole } from '../../entity';
import { handleConnection } from '../../handlers/database/handleConnection';
import { getGuild } from '../../lib/utils/guild/getGuild';
import { getGuildChannel } from '../../lib/utils/guild/getGuildChannel';
import { getGuildEmoji } from '../../lib/utils/guild/getGuildEmoji';
import { getGuildRole } from '../../lib/utils/guild/getGuildRole';

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

const getGuildObject = (e: EntityGuild | EntityChannel | Reaction | ReactionRole, message: CommandoMessage) => {
  return e instanceof EntityGuild
    ? getGuild(e.id, message.client)
    : e instanceof EntityChannel
      ? (getGuildChannel(e.id, message.client) as TextChannel | null)
      : e instanceof Reaction
        ? getGuildEmoji(e.id, message.guild)
        : e instanceof ReactionRole
          ? getGuildRole(e.id, message.guild)
          : null;
};

const getEmbedValue = (e: Embed, c: EntityChannel) => {
  return `${e.title} | ${c.name}`;
};

const getGuildValues = (g: EntityGuild, message: CommandoMessage) => {
  const values: GuildObjectValues = {
    guild: (<Guild>getGuildObject(g, message)).toString(),
    channels: (<EntityChannel[]>g.channels).map((c) => <TextChannel>getGuildObject(c, message)).join('\n'),
    embeds: (<EntityChannel[]>g.channels)
      .map((c) => (<Embed[]>c.embeds).map((e) => getEmbedValue(e, c)).join('\n'))
      .join('\n'),
    reactions: (<EntityChannel[]>g.channels)
      .map((c) =>
        (<Embed[]>c.embeds).map((e) => e.reactions.map((r) => `${getGuildObject(r, message)} | ${e.title}`)).join('\n'),
      )
      .join('\n'),
    roles: (<ReactionRole[]>g.roles).map((r) => `${getGuildObject(r, message)} | ${r.enabled}`).join('\n'),
  };

  return values;
};

const noEntries = 'No Entries';

export default class viewGuild extends Command {
  constructor(client: CommandoClient) {
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
    const conn = await handleConnection();

    const guild = this.client.owners.includes(message.author) ? getGuildFromOwner(this.client, message) : message.guild;

    const queryGuild = await conn
      .getRepository(EntityGuild)
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.channels', 'channel')
      .leftJoinAndSelect('g.roles', 'role')
      .leftJoinAndSelect('channel.embeds', 'embed')
      .leftJoinAndSelect('embed.reactions', 'reaction')
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
