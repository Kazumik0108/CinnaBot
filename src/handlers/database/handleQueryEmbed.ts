import { EmbedField, MessageEmbed } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { Connection } from 'typeorm';
import { EntityOutput } from '../../lib/common/types';

export const handleQueryEmbed = async (
  message: CommandoMessage,
  conn: Connection,
  entity: EntityOutput,
  queries: EntityOutput[],
) => {
  if (queries.length == 0) return null;

  const columns = Object.keys(conn.getMetadata(entity as never).propertiesMap).filter((c) => c in queries[0]);
  const fields = <EmbedField[]>[];
  for (const column of columns) {
    const value = `\`\`\`\n${queries.map((q) => (q as never)[column]).join('\n')}\n\`\`\``;
    fields.push({ name: column, value: value, inline: true });
  }

  const embed = new MessageEmbed()
    .setAuthor(message.author.username, message.author.displayAvatarURL())
    .setTitle(entity.name)
    .addFields(fields);

  return embed;
};
