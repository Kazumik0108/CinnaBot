// emotelist.ts
import { MessageEmbed, Guild, GuildEmoji, Message, Collection } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { getUserGuilds } from '../../functions/filters';

interface emoteMessage {
  embed: MessageEmbed;
  staticList: string[];
  animatedList: string[];
}

const emoteToText = (emotes: GuildEmoji[]): string[] => {
  return emotes
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    .map((emote) => emote.toString());
};

export const displayEmotes = (message: CommandoMessage, emotes: string[]) => {
  let emoteLine = '';
  for (let i = 1; i <= emotes.length; i++) {
    emoteLine += emotes[i - 1];

    if (i % 5 == 0 || i == emotes.length) {
      message.say(emoteLine);
      emoteLine = '';
    }
  }
};

export const getGuildEmotes = async (guild: Guild): Promise<emoteMessage> => {
  const emoteStatic = guild.emojis.cache.filter((emote) => !emote.animated).map((emote) => emote);
  const emoteAnimated = guild.emojis.cache.filter((emote) => emote.animated).map((emote) => emote);
  // Create the embed message as the header
  const embedMessage = new MessageEmbed()
    .setTitle(`${guild.name} Emote List`)
    .setThumbnail(guild.iconURL() as string)
    .setFooter(`Updated ${new Date().toUTCString()}`)
    .addFields([
      { name: 'Static Emotes', value: `(${emoteStatic.length}/100)`, inline: true },
      { name: 'Animated Emotes', value: `(${emoteAnimated.length}/100)`, inline: true },
    ]);

  // Create the emoteMessage object
  const message: emoteMessage = {
    embed: embedMessage,
    staticList: emoteToText(emoteStatic),
    animatedList: emoteToText(emoteAnimated),
  };

  return message;
};

export const sendGuildEmotes = async (message: CommandoMessage, emoteMsg: emoteMessage): Promise<void> => {
  await message.say(emoteMsg.embed);
  await message.say('**Static Emotes**');
  displayEmotes(message, emoteMsg.staticList);
  await message.say('**Animated Emotes**');
  displayEmotes(message, emoteMsg.animatedList);
};

export default class serverEmoteList extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'emotelist',
      group: 'emote',
      memberName: 'emotelist',
      description:
        "Sends the list of emotes from a server. The author can only show emotes from servers they share with the client. Send '0' to show the list of emotes in the current server.",
      examples: ['+emotelist', '+emotelist 0'],
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['MANAGE_EMOJIS', 'MANAGE_MESSAGES'],
      throttling: {
        usages: 5,
        duration: 20,
      },
    });
  }

  async run(message: CommandoMessage) {
    const arg = message.content.slice(this.examples[0].length).trim();

    if (arg === '0') {
      const emoteMsg = await getGuildEmotes(message.guild as Guild);
      await sendGuildEmotes(message, emoteMsg);
      return null;
    }

    const userGuilds: Guild[] = getUserGuilds(message).map((guild) => guild);

    const guildNames = userGuilds.map((guild, index) => `${index}: ${guild.name}`).join('\n');
    const prompt = 'choose a number below:\n```\n' + guildNames + '```\n or `cancel` to abort this command.\n';
    (await message.reply(prompt)).delete({ timeout: 30 * 1000 });

    const filter = (msg: Message) =>
      msg.author.id === message.author.id &&
      (msg.content.toLowerCase() === 'cancel' ||
        (parseInt(msg.content, 10) >= 0 && parseInt(msg.content, 10) < userGuilds.length));

    const collector = message.channel.createMessageCollector(filter, { time: 30 * 1000 });

    collector.on('collect', async (collect: Message) => {
      if (collect.content.toLowerCase() === 'end') return collector.stop();

      const guild = userGuilds[parseInt(collect.content, 10)];
      if (guild) {
        const emoteMsg = await getGuildEmotes(guild);
        await sendGuildEmotes(message, emoteMsg);
        collector.stop();
      }
    });

    collector.on('end', async (collected: Collection<string, Message>) => {
      if (collected.some((collect) => collect.content.toLowerCase() === 'cancel')) {
        (await message.reply('canceling the command.')).delete({ timeout: 5000 });
      }

      collected.forEach((msg) => msg.delete({ timeout: 2000 }));
    });

    message.delete({ timeout: 5000 });

    return null;
  }
}
