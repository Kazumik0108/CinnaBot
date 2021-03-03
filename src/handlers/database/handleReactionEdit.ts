import { GuildEmoji, Message } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { Connection } from 'typeorm';
import { ReactionRole } from '../../entity/ReactionRole';
import { messageEmojiFilter } from '../../functions/collectorFilters';
import { EMOJI_REGEX, ID_EMOJI_REGEX } from '../../functions/regexFilters';
import { handleReactionQuery } from './handleReactionQuery';

export const handleReactionEdit = async (rrole: ReactionRole, conn: Connection, message: CommandoMessage) => {
  let reaction = rrole.reaction;
  const prompt =
    reaction != undefined
      ? await message.reply(
          `The role @${rrole.name} uses ${reaction.name} for reactions. Reply to this message with an emoji to use for the reaction role.`,
        )
      : await message.reply(
          `The role @${rrole.name} does not have a designated emoji. Reply to this message with an emoji to use for the reaction role.`,
        );

  const filter = (m: Message) => messageEmojiFilter(m, message);
  const collector = message.channel.createMessageCollector(filter, { time: 15 * 1000 });

  collector.on('collect', async (m: Message) => {
    const emojis = <RegExpMatchArray>m.content.match(EMOJI_REGEX);
    let react: GuildEmoji | undefined = undefined;
    for (const emoji of emojis) {
      const id = emoji.match(ID_EMOJI_REGEX);
      if (id == null) continue;
      react = message.client.emojis.cache.get(id[0]);
      if (react != undefined) break;
    }

    if (react == undefined) return;
    reaction = await handleReactionQuery(react, conn, rrole);
    console.log(rrole.reaction, reaction.roles);
  });

  collector.on('end', () => {
    prompt.delete({ timeout: 5 * 1000 }).catch((e) => console.log('Failed to delete the prompt message: ', e));
  });
};
