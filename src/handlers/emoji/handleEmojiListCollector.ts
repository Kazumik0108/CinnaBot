import { Collection, Message } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { messageFilterArgs } from '../../lib/utils/collector/filterMessage';
import { getUserGuilds } from '../../lib/utils/user/getUserGuilds';
import { handleEmojiListGuild } from './handleEmojiListGuild';

export const handleEmojiListCollector = async (message: CommandoMessage) => {
  const userGuilds = getUserGuilds(message).array();
  const guildNames = userGuilds.map((g, i) => `${i}: ${g.name}`).join('\n');
  const prompt = `Choose a server number below, or \`cancel\` to abort this command.\`\`\`${guildNames}\`\`\``;

  (await message.reply(prompt)).delete({ timeout: 30 * 1000 });

  const indices = [...Array(userGuilds.length).keys()].map((i) => String(i));
  const filter = (msg: Message) => messageFilterArgs(message, msg, indices);
  const collector = message.channel.createMessageCollector(filter, { time: 30 * 1000 });

  collector.on('collect', async (collect: Message) => {
    if (collect.content.toLowerCase() == 'cancel') {
      collector.stop();
      return;
    }

    const guild = userGuilds[parseInt(collect.content, 10)];
    await handleEmojiListGuild(message, guild);
  });

  collector.on('end', async (collected: Collection<string, Message>) => {
    if (collected.some((m) => m.content.toLowerCase() == 'cancel')) {
      (await message.reply('Canceling the command.')).delete({ timeout: 5 * 1000 });
    }
    collected.forEach((m) => {
      m.delete({ timeout: 3 * 1000 }).catch(() => console.log(`Failed to delete a message in ${m.channel}`));
    });
  });
};
