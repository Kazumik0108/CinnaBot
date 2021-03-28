import { GuildEmoji, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Channel, Embed, Reaction } from '../../entity';
import { handleConnection } from '../../handlers/database/handleConnection';
import { CHANNEL_ID } from '../../lib/common/regex';
import { getGuildEmoji } from '../../lib/utils/guild/getGuildEmoji';

interface PromptArgs {
  reaction: GuildEmoji;
  channel: TextChannel;
  embed: Embed;
}

export default class registerReaction extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'registerreaction',
      aliases: ['regreaction', 'regr', 'rr'],
      memberName: 'registerreaction',
      group: 'database',
      description: 'Register an emoji to the database for use in reaction roles.',
      guildOnly: true,
      argsSingleQuotes: true,
      args: [
        {
          key: 'reaction',
          prompt: 'Specify the id or name of the emoji to register. The input is case-sensitive.',
          type: 'string',
          validate: (property: string, msg: CommandoMessage) => {
            const emoji = getGuildEmoji(property, msg.guild);
            return emoji != null ? true : false;
          },
          parse: (property: string, msg: CommandoMessage) => {
            const emoji = <GuildEmoji>getGuildEmoji(property, msg.guild);
            return emoji;
          },
        },
        {
          key: 'channel',
          prompt: 'Mention the channel where the embed message is located.',
          type: 'string',
          validate: (mention: string, msg: CommandoMessage) => {
            if (!CHANNEL_ID.test(mention)) return false;
            const id = (mention.match(CHANNEL_ID) as string[])[0];

            const channel = msg.guild.channels.cache.get(id);
            return channel != undefined ? true : false;
          },
          parse: (mention: string, msg: CommandoMessage) => {
            const id = (mention.match(CHANNEL_ID) as string[])[0];
            const channel = <TextChannel>msg.guild.channels.cache.get(id);
            return channel;
          },
        },
        {
          key: 'embed',
          prompt: 'Specify the title of the embed message to register the reaction to. ',
          type: 'string',
          validate: async (title: string) => {
            const conn = await handleConnection();
            const embed = await conn
              .getRepository(Embed)
              .createQueryBuilder('e')
              .leftJoinAndSelect('e.channel', 'channel')
              .where('e.title = :title', { title: title })
              .getOne();
            return embed == undefined ? false : true;
          },
          parse: async (title: string) => {
            const conn = await handleConnection();
            const embed = await conn
              .getRepository(Embed)
              .createQueryBuilder('e')
              .leftJoinAndSelect('e.channel', 'channel')
              .where('e.title = :title', { title: title })
              .getOne();
            return embed;
          },
          error: 'Either the ',
        },
      ],
    });
  }

  async run(message: CommandoMessage, { reaction, channel, embed }: PromptArgs) {
    if (channel.id != embed.channel.id) {
      message.reply(`an embed message with titled **${embed.title}** could not be found in ${channel}.`);
      return null;
    }

    const conn = await handleConnection();

    const dupReactions = await conn
      .createQueryBuilder()
      .select('r')
      .from(Reaction, 'r')
      .where('r.id = :id', { id: reaction.id })
      .getMany();

    if (dupReactions.length > 0) {
      let isDupe = false;
      for (const r of dupReactions) {
        r.embed = (await conn.createQueryBuilder().relation(Reaction, 'embed').of(r).loadOne()) as Embed;
        if (r.embed.title != embed.title) continue;

        r.embed.channel = (await conn.createQueryBuilder().relation(Embed, 'channel').of(r.embed).loadOne()) as Channel;
        if (r.embed.channel.id != channel.id) continue;

        isDupe = true;
      }

      if (isDupe) {
        message.reply(
          `the emoji ${reaction} is already registered to an embed message titled **${embed.title}** in ${channel}.`,
        );
        return null;
      }
    }

    const result = await conn
      .createQueryBuilder()
      .insert()
      .into(Reaction)
      .values({ id: reaction.id, name: reaction.name })
      .execute();

    await conn.createQueryBuilder().relation(Reaction, 'embed').of(result.identifiers[0].uuid).set(embed);

    message.reply(
      `the emoji ${reaction} has been registered to an embed message titled **${embed.title}** in ${channel}.`,
    );
    return null;
  }
}
