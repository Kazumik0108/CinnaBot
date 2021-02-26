import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { guildRinSolo } from '../../info/server/guilds';
import { stripIndents } from 'common-tags';

export default class embedPreFormatted extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'embed',
      group: 'server',
      memberName: 'embed',
      description: 'Send a pre-formatted embed message to the channel',
      examples: ['+embed'],
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['MANAGE_CHANNELS'],
    });
  }

  async run(message: CommandoMessage) {
    const guild = message.client.guilds.cache.get(guildRinSolo.id);
    if (guild == undefined) {
      message
        .say(`There are no pre-formatted embed messages in ${message.guild?.name}`)
        .then((msg) => msg.delete({ timeout: 5000 }));
      return null;
    }

    const embeds = guildRinSolo.embed;
    const embedNames = embeds.map((embed) => embed.name);

    const prompt = stripIndents`Select a pre-formatted embed message below from ${message.guild.name}.
      \`\`\`
      ${embedNames}
      \`\`\`
      This message will automatically time out after 15 seconds.`;
    const msgPrompt = await message.say(prompt);

    const filter = (msg: CommandoMessage) =>
      msg.author.id === message.author.id && embedNames.includes(msg.content.toLowerCase());

    const collector = message.channel.createMessageCollector(filter, { time: 15 * 1000 });

    collector.on('collect', async (collected: CommandoMessage) => {
      const embedMessage = embeds.find((embed) => embed.name == collected.content.toLowerCase());
      if (embedMessage == undefined) return;

      const embed = await message.say(embedMessage.embed);
      const reactionEmotes = embedMessage.reactions;
      for (const reactionEmote of reactionEmotes) {
        const reaction = message.client.emojis.cache.get(reactionEmote.id);
        if (reaction == undefined) return;
        await embed.react(reaction);
      }
      collector.stop();
    });

    collector.on('end', (collected) => {
      message.delete({ timeout: 3000 });
      collected.forEach((collect) => collect.delete({ timeout: 3000 }));
      msgPrompt.delete({ timeout: 3000 });
    });

    return null;
  }
}
