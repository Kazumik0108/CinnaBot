import { Collection, Guild, GuildEmoji, MessageEmbed } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';

const emojiMessage = (emojis: Collection<string, GuildEmoji>) => {
  const strings = sortEmojiStrings(emojis);

  let contents = [];
  let size = Math.ceil(strings.length / 25);
  for (let i = 1; i <= size; i++) {
    const block = strings.slice(25 * (i - 1), 25 * i);
    contents.push(block);
  }

  contents = contents.map((block) => {
    const group = [];
    size = Math.ceil(block.length / 5);
    for (let i = 1; i <= size; i++) {
      const line = block.slice(5 * (i - 1), 5 * i);
      group.push(line);
    }
    return group.join('\n').replace(/,/g, '');
  });

  return contents;
};

const sortEmojiStrings = (emojis: Collection<string, GuildEmoji>) => {
  const strings = emojis
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    .map((e) => e.toString());
  return strings;
};

const embedMessage = (guild: Guild) => {
  const emojiStatic = guild.emojis.cache.filter((e) => !e.animated).size;
  const emojiAnimated = guild.emojis.cache.filter((e) => e.animated).size;
  return new MessageEmbed()
    .setTitle(`${guild.name} Emote List`)
    .setThumbnail(guild.iconURL() as string)
    .setTimestamp(new Date())
    .addFields([
      { name: 'Static Emotes', value: `(${emojiStatic}/100)`, inline: true },
      { name: 'Animated Emotes', value: `(${emojiAnimated}/100)`, inline: true },
    ]);
};

export const handleEmojiListGuild = async (message: CommandoMessage, guild: Guild) => {
  const embed = embedMessage(guild);
  const messageStatic = emojiMessage(guild.emojis.cache.filter((e) => !e.animated));
  const messageAnimated = emojiMessage(guild.emojis.cache.filter((e) => e.animated));

  await message.say(embed);
  if (messageStatic.length > 0) {
    await message.say('__Static Emotes__');
    for (const content of messageStatic) {
      await message.say(content);
    }
  }

  if (messageAnimated.length > 0) {
    await message.say('__Animated Emotes__');
    for (const content of messageAnimated) {
      await message.say(content);
    }
  }
};
