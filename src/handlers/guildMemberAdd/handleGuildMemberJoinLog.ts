import { GuildMember, TextChannel } from 'discord.js';
import { guildRinSolo } from '../../info/server/guilds';

export const handleGuildMemberJoinLog = async (member: GuildMember) => {
  const guildQuery = guildRinSolo;
  const channel = <TextChannel | undefined>member.guild.channels.cache.get(guildQuery.logChannel);
  if (channel == undefined) return;

  channel.send(`${member} has joined ${member.guild.name}!`);
};
