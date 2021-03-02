// eslint-disable-next-line prettier/prettier
import { CategoryChannel, Guild, GuildChannel, GuildMember, Message, NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';
import { CommandoClient, CommandoGuild, CommandoMessage } from 'discord.js-commando';

export interface GetGuildRoleOptions {
  message: Message | CommandoMessage;
  property: string;
}

export const getGuildMember = (userID: string, message: CommandoMessage): GuildMember | null => {
  const guildMember = message.guild.member(userID);
  if (guildMember != null) return guildMember;
  return null;
};

export const getGuildRole = (options: GetGuildRoleOptions) => {
  const guild = <CommandoGuild | Guild>options.message.guild;
  const role = guild.roles.cache.find((r) => r.id == options.property || r.name == options.property);
  if (role != undefined) return role;
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
