import { GuildMember, TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { guildRinSolo } from '../info/server/guilds';

export const main = (client: CommandoClient, member: GuildMember) => {
  const logChannel = client.channels.cache.get(guildRinSolo.logChannel) as TextChannel | undefined;
  if (logChannel == undefined) {
    console.log(`The channel ID ${guildRinSolo.logChannel} does not exist in channels cache.`);
    return;
  }

  const guild = client.guilds.cache.get(guildRinSolo.id);
  if (guild == undefined) {
    console.log(`The guild ID ${guildRinSolo.id} does not exist in guilds cache.`);
    return;
  }
  logChannel.send(`${member.user.username} has joined ${member.guild.name}!`);

  if (member.user.bot) return;

  const welcomeChannel = client.channels.cache.get(guildRinSolo.welcomeChannel) as TextChannel | undefined;
  if (welcomeChannel == undefined) {
    console.log(`The channel ID ${guildRinSolo.welcomeChannel} does not exist in channels cache.`);
    return;
  }
  logChannel.send(`${member.user.username} has joined ${member.guild.name}!`);
  const embedMessage = guildRinSolo.welcomeEmbed
    .setTitle(member.guild.name)
    .setThumbnail(member.user.avatarURL() as string);
  welcomeChannel.send(`Welcome <@${member.user.id}>!`, embedMessage);
};
