import { ClientUser, Collection, Guild, PermissionResolvable, TextChannel } from 'discord.js';
import { CommandoGuild, CommandoMessage } from 'discord.js-commando';

import { getUserGuilds, searchEmojiName } from '../../functions/parsers';
import { EMOJI_REPLACE_REGEX } from '../../functions/regexFilters';

const checkMessageFormat = async (message: CommandoMessage) => {
  const colons = message.content.match(/:/g) ?? [];
  const backticks = message.content.match(/`/g) ?? [];
  const escapes = message.content.match(/\\/g) ?? [];
  if (colons.length >= 2 && backticks.length < 2 && escapes.length < 1) return true;
  return false;
};

const checkClientPerms = async (message: CommandoMessage) => {
  const bot = message.guild.member(<ClientUser>message.client.user);
  if (bot == null) return false;

  const flags = <PermissionResolvable>['MANAGE_MESSAGES', 'MANAGE_WEBHOOKS'];
  if (!bot.permissions.has(flags)) {
    const prompt = `I require ${flags} permissions in this server to replace non-nitro emotes in a message.`;
    (await message.reply(prompt)).delete({ timeout: 10 * 1000 });
    return false;
  }
  return true;
};

const checkEveryonePerms = async (message: CommandoMessage) => {
  const everyone = message.guild.roles.cache.find((role) => role.name == '@everyone');
  if (everyone == undefined) return false;

  const flags = <PermissionResolvable>['USE_EXTERNAL_EMOJIS'];
  if (!everyone.permissions.has(flags)) {
    const prompt = `The role \`@everyone\` requires ${flags} permissions in this server to replace non-nitro emotes in a message.`;
    (await message.reply(prompt)).delete({ timeout: 10 * 1000 });
    return false;
  }
  return true;
};

const sendMessageWebhook = async (message: CommandoMessage, content: string) => {
  const member = message.member;
  if (member == null) return;

  const nickname = member.displayName;
  const avatar = member.user.displayAvatarURL();

  const channel = <TextChannel>message.channel;

  let webhook = (await channel.fetchWebhooks()).first();
  if (webhook == undefined) {
    const client = <ClientUser>message.client.user;
    webhook = await channel.createWebhook(client.username);
  }

  const webhookMessage = <CommandoMessage>await webhook.send(content, {
    username: nickname,
    avatarURL: avatar,
  });
  return webhookMessage;
};

export const handleNonNitroEmoji = async (message: CommandoMessage) => {
  const validMessage = await checkMessageFormat(message);
  if (!validMessage) return null;

  const validPerms = (await checkClientPerms(message)) && (await checkEveryonePerms(message));
  if (!validPerms) return null;

  const content = message.content.replace(EMOJI_REPLACE_REGEX, (substring: string, match: string) => {
    if (match == undefined) return substring;

    let guilds: CommandoGuild | Guild | Collection<string, Guild> = message.guild;
    let emoteMatch = searchEmojiName(guilds, match);
    if (emoteMatch != undefined) return emoteMatch.toString();

    guilds = getUserGuilds(message);
    emoteMatch = searchEmojiName(guilds, match);
    if (emoteMatch != undefined) return emoteMatch.toString();

    guilds = message.client.guilds.cache;
    emoteMatch = searchEmojiName(guilds, match);
    if (emoteMatch != undefined) return emoteMatch.toString();

    return substring;
  });

  if (message.content == content) return null;

  const webhookMessage = await sendMessageWebhook(message, content);
  return webhookMessage != undefined ? webhookMessage : null;
};
