import {
  CategoryChannel,
  GuildChannel,
  GuildMember,
  NewsChannel,
  Role,
  StoreChannel,
  TextChannel,
  VoiceChannel,
} from 'discord.js';
import { CommandoClient, CommandoMessage } from 'discord.js-commando';

export const getGuildMember = (userID: string, message: CommandoMessage): GuildMember | null => {
  const guildMember = message.guild.member(userID);
  if (guildMember != null) return guildMember;
  return null;
};

export const getGuildRole = (roleID: string, message: CommandoMessage): Role | null => {
  const guildRole = message.guild.roles.cache.get(roleID);
  if (guildRole != null) return guildRole;
  return null;
};

export const getGuildChannel = (
  channelID: string,
  guildReference: CommandoMessage | CommandoClient,
): GuildChannel | null => {
  const guildChannel =
    guildReference instanceof CommandoMessage
      ? guildReference.guild.channels.cache.get(channelID)
      : guildReference.channels.cache.get(channelID);
  if (guildChannel == undefined || guildChannel.type == 'dm') return null;
  switch (guildChannel.type) {
    case 'text':
      return guildChannel as TextChannel;
    case 'voice':
      return guildChannel as VoiceChannel;
    case 'category':
      return guildChannel as CategoryChannel;
    case 'news':
      return guildChannel as NewsChannel;
    case 'store':
      return guildChannel as StoreChannel;
    default:
      return null;
  }
};
