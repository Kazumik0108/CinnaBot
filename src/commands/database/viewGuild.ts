import { Message, MessageEmbed } from 'discord.js';
import { CommandoGuild, CommandoMessage } from 'discord.js-commando';
import { GuildEntity } from '../../entity';
import { ConnectionClient, ConnectionCommand } from '../../lib/common/classes';
import { Entities } from '../../lib/common/enums';
import { isGuildEntity } from '../../lib/database/getEntity';
import { registerGuildOnValidate } from '../../lib/database/registerOnValidate';
import { selectOne } from '../../lib/database/select';
import { validate } from '../../lib/database/validate';

interface GuildView {
  guild: string;
  channels: string;
  embeds: string;
  reactions: string;
  roles: string;
}

// const noEntries = 'No Entries';

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
    const conn = this.client.conn;
    const guild = this.client.owners.includes(message.author) ? await getGuildFromOwner(message) : message.guild;

    const exists = await validate(conn, guild, Entities.Guild);
    if (!exists) registerGuildOnValidate(this.client.conn, message, guild);

    const entity = await selectOne(conn, guild, Entities.Guild);
    if (entity == undefined || !isGuildEntity(entity)) return null;

    entity.channels = await conn.createQueryBuilder().relation(GuildEntity, 'channels').of(guild).loadMany();
    entity.embeds = await conn.createQueryBuilder().relation(GuildEntity, 'embeds').of(guild).loadMany();
    entity.reactions = await conn.createQueryBuilder().relation(GuildEntity, 'reactions').of(guild).loadMany();
    entity.roles = await conn.createQueryBuilder().relation(GuildEntity, 'roles').of(guild).loadMany();

    const view: GuildView = {
      guild: entity.name,
      channels: entity.channels.map((c) => c.getChannel(guild)).join('\n'),
      embeds: entity.embeds.map((e) => e.title).join('\n'),
      reactions: entity.reactions.map((r) => `${r.getReaction(guild)} \\${r.getReaction(guild)}`).join('\n'),
      roles: entity.roles.map((r) => r.getRole(guild)).join('\n'),
    };

    const none = 'No entries';
    const embed = new MessageEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setTitle(view.guild)
      .setThumbnail(guild.iconURL() as string)
      .addFields([
        {
          name: 'Channels',
          value: view.channels || none,
        },
        {
          name: 'Embed Messages',
          value: view.embeds || none,
        },
        {
          name: 'Reactions',
          value: view.reactions || none,
        },
        {
          name: 'Roles',
          value: view.roles || none,
        },
      ]);

    message.embed(embed);
    return null;
    //   const embed = new MessageEmbed()
    //     .setAuthor(message.author.username, message.author.displayAvatarURL())
    //     .setTitle(`Database Entries`)
    //     .setThumbnail(guild.iconURL() as string)
    //     .addFields([
    //       {
    //         name: 'Guild',
    //         value: values.guild,
    //       },
    //       {
    //         name: 'Channels',
    //         value: values.channels || noEntries,
    //       },
    //       {
    //         name: 'Embed Messages',
    //         value: values.embeds || noEntries,
    //       },
    //       {
    //         name: 'Reactions',
    //         value: values.reactions || noEntries,
    //       },
    //       {
    //         name: 'Roles',
    //         value: values.roles || noEntries,
    //       },
    //     ]);

    //   message.embed(embed);
    //   return null;
    // }
  }
}

async function getGuildFromOwner(message: CommandoMessage) {
  const guilds = message.client.guilds.cache.array();

  let list = '';
  guilds.forEach((g, i) => {
    list = list.concat(`${i}\t${g.name}\n`);
  });

  await message.say('Select a guild to view, or `cancel` to end the command.\n```\n' + list + '\n```');
  const collected = await message.channel.awaitMessages((m: CommandoMessage) => filter(message, m), {
    max: 1,
    time: 10 * 1000,
  });

  if (collected.first() == undefined) return message.guild;
  const index = parseInt((collected.first() as Message).content);

  return guilds[index] as CommandoGuild;
}

function filter(message: CommandoMessage, m: CommandoMessage) {
  if (m.author != message.author) return false;
  if (m.content.toLowerCase() == 'cancel') return true;

  const match = m.content.match(/^[0-9|]+$/);
  if (match == null) return false;

  const num = parseFloat(match[0]);
  return num >= 0 && num < message.client.guilds.cache.size ? true : false;
}
