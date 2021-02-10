// guildMemberAdd.ts
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { welcomeGuilds } from '../info/server/welcome';

export const main = (client: CommandoClient, member: GuildMember) => {
  if (!welcomeGuilds.has(member.guild.id)) return;

  const welcomeGuild = welcomeGuilds.get(member.guild.id);
  if (welcomeGuild == undefined) return;

  if (welcomeGuild.logChannelID == undefined) return;
  const logChannel = client.channels.cache.get(welcomeGuild.logChannelID) as TextChannel;
  logChannel.send(`${member.user.username} has joined ${member.guild.name}!`);

  if (member.user.bot || welcomeGuild.welcomeChannelID == undefined) return;
  const embedMessage = (welcomeGuild?.welcome as MessageEmbed)
    .setTitle(member.guild.name)
    .setThumbnail(member.user.avatarURL() as string);

  const welcomeChannel = client.channels.cache.get(welcomeGuild.welcomeChannelID) as TextChannel;
  welcomeChannel.send(`Welcome <@${member.user.id}>!`, embedMessage);
};
