import { GuildMember, TextChannel } from 'discord.js';
import { guildRinSolo } from '../../info/server/guilds';

export const handleWelcomeMessage = async (member: GuildMember) => {
  const guildQuery = guildRinSolo;
  const channel = <TextChannel | undefined>member.guild.channels.cache.get(guildQuery.welcomeChannel);
  if (channel == undefined) return;

  const embed = guildQuery.welcomeEmbed
    .setTitle(member.guild.name)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp(new Date());

  channel.send(`Welcome ${member}!`, embed);
};
