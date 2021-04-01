import { stripIndents } from 'common-tags';
import { GuildChannel, GuildEmoji, Role } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { handleConnection } from '../../handlers/database/handleConnection';
import { handleGuildCheck } from '../../handlers/database/handleGuildCheck';
import { handleRegisterGuild } from '../../handlers/database/handleRegisterGuild';
import { handleRegisterGuildEntity } from '../../handlers/database/handleRegisterGuildEntity';
import { ConnectionClient, ConnectionCommand } from '../../lib/common/classes';
import { EntityInput } from '../../lib/common/types';
import { isGuildChannel, isTextChannel } from '../../lib/utils/guild/channelType';
import { getGuildChannel } from '../../lib/utils/guild/getGuildChannel';
import { getGuildEmoji } from '../../lib/utils/guild/getGuildEmoji';
import { getGuildRole } from '../../lib/utils/guild/getGuildRole';

interface PromptArgs {
  entity: EntityInput;
}

const ENTITY_VALUES: EntityInput[] = ['channel', 'guild', 'reaction', 'role'];

const entityCallback = (entity: EntityInput) => {
  if (entity == 'channel') return getGuildChannel;
  if (entity == 'reaction') return getGuildEmoji;
  return getGuildRole;
};

const getGuildSearchProperty = async (message: CommandoMessage, entity: EntityInput) => {
  message.say(
    `Specify the id or name of the ${entity} to register into the database, or \`cancel\` to abort the command.`,
  );

  const callback = entityCallback(entity);
  const filter = (m: CommandoMessage) => {
    const isAuthor = message.author == m.author;
    if (!isAuthor) return false;

    const isCancel = m.content == 'cancel';
    if (isCancel) return true;

    const isGuildEntity = callback(m.content, m.guild) != null;
    if (!isGuildEntity) message.say(`Invalid id or name.`);
    return isGuildEntity;
  };

  const input = (await message.channel.awaitMessages(filter, { time: 15 * 1000, max: 1 })).first();
  return input;
};

export default class registerEntity extends ConnectionCommand {
  constructor(client: ConnectionClient) {
    super(client, {
      name: 'registerentity',
      aliases: ['rey'],
      memberName: 'registerentity',
      group: 'database',
      description: 'Register a guild or guild entity into the database.',
      guildOnly: true,
      args: [
        {
          key: 'entity',
          prompt: stripIndents`
            Please enter one of the following options: \`${ENTITY_VALUES.join('`, `')}\``,
          type: 'string',
          oneOf: ENTITY_VALUES,
        },
      ],
    });
  }

  async run(message: CommandoMessage, { entity }: PromptArgs) {
    this.client.conn = await handleConnection();

    if (entity == 'guild') {
      await handleRegisterGuild(message, this.client.conn);
      return;
    }

    const property = await getGuildSearchProperty(message, entity);
    if (property == null || property.content == 'cancel') {
      message.say('The command was canceled or no valid id or name was given before the command timed.');
      return;
    }

    const guild = await handleGuildCheck(message, this.client.conn);
    if (guild == null) return;

    const guildEntity =
      entity == 'channel'
        ? <GuildChannel>getGuildChannel(property.content, message.guild)
        : entity == 'reaction'
          ? <GuildEmoji>getGuildEmoji(property.content, message.guild)
          : <Role>getGuildRole(property.content, message.guild);

    if (isGuildChannel(guildEntity) && !isTextChannel(guildEntity)) {
      message.say('Only text channels can be registered.');
      return;
    }

    await handleRegisterGuildEntity(message, guildEntity, entity, this.client.conn);

    return;
  }
}
