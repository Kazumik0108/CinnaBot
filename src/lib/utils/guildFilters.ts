import { CategoryChannel, GuildChannel, NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';
import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GetGuildRoleOptions } from '../../lib/types/common/interfaces';

export const getGuildMember = (id: string, m: CommandoMessage) => {
  const member = m.guild.member(id);
  if (member != null) return member;
  return null;
};

export const getGuildRole = (args: GetGuildRoleOptions) => {
  const { message, property } = args;
  const role = message.guild?.roles.cache.find((r) => r.id == property || r.name == property);
  if (role != undefined) return role;
  return null;
};

export const getGuildChannel = (id: string, ref: CommandoMessage | CommandoClient): GuildChannel | null => {
  const channel = ref instanceof CommandoMessage ? ref.guild.channels.cache.get(id) : ref.channels.cache.get(id);
  if (channel == undefined || channel.type == 'dm') return null;
  switch (channel.type) {
    case 'text':
      return channel as TextChannel;
    case 'voice':
      return channel as VoiceChannel;
    case 'category':
      return channel as CategoryChannel;
    case 'news':
      return channel as NewsChannel;
    case 'store':
      return channel as StoreChannel;
    default:
      return null;
  }
};
