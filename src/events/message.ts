// message.ts
import { ClientUser, GuildEmoji, TextChannel } from 'discord.js';
import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { botReactions } from '../info/server/botReactions';
import { getUserGuilds } from '../functions/parsers';
import { EMOJI_FORMAT_REGEX } from '../functions/regexFilters';

const checkMessageEmotes = (message: CommandoMessage): boolean => {
  const hasColonPair = message.content.split(/:/).length > 2;
  const hasNoCode = message.content.split(/`/).length <= 1 && message.content.split(/\\/).length <= 1;
  return hasColonPair && hasNoCode;
};

const checkMessageReacts = (message: CommandoMessage): boolean => {
  const reactRegex = /<a?:\w+:\d+>/g;
  const hasEmoteOnly = message.content.split(reactRegex).every((text) => !text.match(/\w/));
  return hasEmoteOnly;
};

const emoteReplace = (message: CommandoMessage) => {
  const newMessage = message.content.replace(EMOJI_FORMAT_REGEX, replaceMessageEmotes);
  if (message.content != newMessage) sendMessageWebhook(message, newMessage);

  function replaceMessageEmotes(substring: string, regexMatch: string): string {
    if (regexMatch == undefined) return substring;

    const emoteMatch = getEmoteMatch(message, regexMatch);
    if (emoteMatch == undefined) return substring;

    return emoteMatch.toString();
  }
};

const getEmoteMatch = (message: CommandoMessage, match: string): GuildEmoji | undefined => {
  let emoteMatch = message.guild.emojis.cache.find((emote) => emote.name.toLowerCase() == match.toLowerCase());
  if (emoteMatch != undefined) return emoteMatch;

  const userGuilds = getUserGuilds(message);
  emoteMatch = userGuilds
    .flatMap((guild) => guild.emojis.cache)
    .find((emote) => emote.name.toLowerCase() === match.toLowerCase());
  if (emoteMatch != undefined) return emoteMatch;

  emoteMatch = message.client.guilds.cache
    .flatMap((guild) => guild.emojis.cache)
    .find((emote) => emote.name.toLowerCase() === match.toLowerCase());
  return emoteMatch;
};

const sendMessageWebhook = async (message: CommandoMessage, content: string) => {
  const bot = message.guild.member(message.client.user as ClientUser);
  if (bot == null) return;
  if (!bot.permissions.has(['MANAGE_MESSAGES', 'MANAGE_WEBHOOKS'])) {
    const errorBot =
      'I require `MANAGE_MESSAGES, MANAGE_WEBHOOKS` permissions in this server to replace emotes in a message.';
    (await message.reply(errorBot)).delete({ timeout: 10 * 1000 });
    return;
  }

  const everyone = message.guild.roles.cache.find((role) => role.name == '@everyone');
  if (everyone == null) return;
  if (!everyone.permissions.has('USE_EXTERNAL_EMOJIS')) {
    const errorEveryone =
      'The role `@everyone` requires `USE_EXTERNAL_EMOJIS` permissions in this server to replace emotes in a message.';
    (await message.reply(errorEveryone)).delete({ timeout: 10 * 1000 });
    return;
  }

  message.delete().catch((error) => console.log('Failed to delete the message: ', error));

  const member = message.member;
  const nickname = member ? member.displayName : message.author.username;
  const avatar = message.author.displayAvatarURL();

  const webhook = (await (message.channel as TextChannel).fetchWebhooks()).first();
  if (webhook != undefined) {
    webhook.send(content, {
      username: nickname,
      avatarURL: avatar,
    });
  } else {
    const newWebhook = await (message.channel as TextChannel).createWebhook(bot.user.username);
    newWebhook.send(content, {
      username: nickname,
      avatarURL: avatar,
    });
  }
};

const botReaction = (message: CommandoMessage) => {
  botReactions.forEach((reactionGroup) => {
    const checkMatch = reactionGroup.emotes.some((reaction) => message.content.includes(reaction));
    if (checkMatch) reactionGroup.emotes.forEach((reaction) => message.react(reaction));
  });
};

export default (client: CommandoClient, message: CommandoMessage) => {
  if (checkMessageReacts(message)) botReaction(message);

  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;

  if (checkMessageEmotes(message)) emoteReplace(message);

  if (message.channel.id == '725406708989427782') {
    const RinBlessed = client.emojis.cache.get('725155394934145105');
    if (RinBlessed == undefined) return;
    const regex = new RegExp(`^(?:^(${RinBlessed}\\s*)+)$`, 'g');
    const match = message.content.match(regex);

    if (match == null) message.delete();
  }
};
