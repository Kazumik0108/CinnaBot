import { Collection, Message } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { messageFilter, MessageFilterOptions } from '../../functions/collectorFilters';
import { guildRinSolo } from '../../info/server/guilds';

export const handleGuildEmbed = async (message: CommandoMessage) => {
  const query = guildRinSolo;
  const guild = message.guild.id == query.id ? message.guild : null;
  if (guild == null) {
    (await message.say(`There are no pre-formatted embed messages in ${message.guild.name}`)).delete({
      timeout: 5 * 1000,
    });
    return;
  }

  const embeds = query.embed;
  const names = embeds.map((e) => e.name);

  const prompt = `Select a pre-formatted embed message below from ${guild.name} or \`cancel\` to abort this command. This message will automatically time out after 10 seconds.\`\`\`${names}\`\`\``;
  (await message.say(prompt)).delete({ timeout: 10 * 1000 });

  const options: MessageFilterOptions = {
    args: names,
  };
  const filter = (msg: Message) => messageFilter(options, msg);
  const collector = message.channel.createMessageCollector(filter, { time: 30 * 1000 });

  collector.on('collect', async (collect: Message) => {
    if (collect.content.toLowerCase() == 'cancel') {
      collector.stop();
      return;
    }

    const embedMessage = embeds.find((e) => collect.content.toLowerCase() == e.name);
    if (embedMessage == undefined) return;

    const m = await message.say(embedMessage.embed);
    if (embedMessage.reactions.length == 0) {
      collector.stop();
      return;
    }

    for (const reaction of embedMessage.reactions) {
      const emoji = guild.emojis.cache.get(reaction.id);
      if (emoji == undefined) continue;
      await m.react(emoji);
    }
    collector.stop();
  });

  collector.on('end', (collected: Collection<string, Message>) => {
    message.delete({ timeout: 3 * 1000 });
    collected.forEach((m) => {
      m.delete({ timeout: 3 * 1000 }).catch(() => console.log(`Failed to delete a message in ${m.channel}`));
    });
  });
};
