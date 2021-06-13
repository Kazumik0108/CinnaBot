import { ClientUser, Collection, Guild, PermissionResolvable, TextChannel } from 'discord.js';
import { Client, CommandoMessage } from 'discord.js-commando';
import { EMOJI_REPLACE } from '../../lib/common/regex';
import { getGuildEmoji } from '../../lib/utils/guild/emoji';
import { getUserGuilds } from '../../lib/utils/user/getUserGuilds';

export async function handleNonNitroEmoji(client: Client, message: CommandoMessage) {
  const valid = checkMessageFormat(message);
  if (!valid) return null;

  const perms = (await checkClientPerms(message)) && (await checkEveryonePerms(message));
  if (!perms) return null;

  const content = message.content.replace(EMOJI_REPLACE, (substring: string, match: string) => {
    if (match == undefined) return substring;

    let guilds: Guild | Collection<string, Guild> = message.guild;
    let emoteMatch = getGuildEmoji(match, guilds, false);
    if (emoteMatch != null) return emoteMatch.toString();

    guilds = getUserGuilds(message);
    emoteMatch = getGuildEmoji(match, guilds, false);
    if (emoteMatch != null) return emoteMatch.toString();

    guilds = client.guilds.cache;
    emoteMatch = getGuildEmoji(match, guilds, false);
    if (emoteMatch != null) return emoteMatch.toString();

    return substring;
  });

  if (message.content == content) return null;

  const webhook = await sendWebhook(message, content);
  if (webhook != null) {
    message.delete().catch((e) => console.error('There was an error trying to delete a message:', e));
  }
  return webhook;
}

function checkMessageFormat(message: CommandoMessage) {
  const colons = message.content.match(/:/g) ?? [];
  const backticks = message.content.match(/`/g) ?? [];
  const escapes = message.content.match(/\\/g) ?? [];
  return colons.length >= 2 && backticks.length < 2 && escapes.length < 1 ? true : false;
}

async function checkClientPerms(message: CommandoMessage) {
  const bot = message.guild.member(<ClientUser>message.client.user);
  if (bot == null) return false;

  const flags = ['MANAGE_MESSAGES', 'MANAGE_WEBHOOKS'] as PermissionResolvable;
  if (!bot.permissions.has(flags)) {
    const prompt = `I require ${flags} permissions in this server to replace non-nitro emotes in a message.`;
    await message.reply(prompt);
    return false;
  }
  return true;
}

async function checkEveryonePerms(message: CommandoMessage) {
  const everyone = message.guild.roles.cache.find((role) => role.name == '@everyone');
  if (everyone == undefined) return false;

  const flags = ['USE_EXTERNAL_EMOJIS'] as PermissionResolvable;
  if (!everyone.permissions.has(flags)) {
    const prompt = `The role \`@everyone\` requires ${flags} permissions in this server to replace non-nitro emotes in a message.`;
    await message.reply(prompt);
    return false;
  }
  return true;
}

async function sendWebhook(message: CommandoMessage, content: string) {
  const member = message.member;
  if (member == null) return null;

  const bot = message.client.user;
  if (bot == null) return null;

  const nickname = member.displayName;
  const avatar = member.user.displayAvatarURL();

  const channel = message.channel as TextChannel;
  const webhook =
    (await channel.fetchWebhooks()).filter((w) => w.owner == message.client.user).first() ??
    (await channel.createWebhook(bot.username, { avatar: bot.displayAvatarURL() }));

  return await webhook.send(content, { username: nickname, avatarURL: avatar });
}
