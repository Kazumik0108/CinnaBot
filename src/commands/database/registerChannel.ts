import { Message, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Channel, Guild } from '../../entity';
import { handleConnection } from '../../handlers/database/handleConnection';
import { handleIDQuery } from '../../handlers/database/handleIDQuery';
import { CHANNEL_ID } from '../../lib/common/regex';
import { getGuildChannel } from '../../lib/utils/guild/getGuildChannel';

interface PromptArgs {
  channel: TextChannel;
}

export default class registerChannel extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'registerchannel',
      aliases: ['regchannel', 'regc', 'rc'],
      memberName: 'registerchannel',
      group: 'database',
      description: 'Register an text channel into the database for this guild.',
      guildOnly: true,
      argsSingleQuotes: true,
      args: [
        {
          key: 'channel',
          prompt: 'Mention the text channel to register.',
          type: 'string',
          validate: (mention: string, msg: Message) => {
            if (!CHANNEL_ID.test(mention)) return false;
            const id = (mention.match(CHANNEL_ID) as string[])[0];

            const channel = <TextChannel | null>getGuildChannel(id, msg);
            return channel != null ? true : false;
          },
          parse: (mention: string, msg: Message) => {
            const id = (mention.match(CHANNEL_ID) as string[])[0];
            const channel = <TextChannel>getGuildChannel(id, msg);
            return channel;
          },
        },
      ],
    });
  }

  async run(message: CommandoMessage, { channel }: PromptArgs) {
    const conn = await handleConnection();

    const guild = (await handleIDQuery(channel.guild, conn)) as Guild | null | undefined;
    if (guild == null || guild == undefined) {
      message.reply(
        `${message.guild} must first be registered to the database. Try using the command \`+registerguilds\`.`,
      );
      return null;
    }

    const queryChannel = await conn
      .createQueryBuilder()
      .select('c')
      .from(Channel, 'c')
      .where('c.id = :id', { id: channel.id })
      .getOne();

    if (queryChannel) {
      message.reply(`the channel ${channel} has already been registered into the database.`);
      return null;
    }

    await conn.createQueryBuilder().insert().into(Channel).values({ id: channel.id, name: channel.name }).execute();
    await conn.createQueryBuilder().relation(Channel, 'guild').of(channel.id).set(guild);

    message.reply(`the channel ${channel} has been registered into the database.`);
    return null;
  }
}
