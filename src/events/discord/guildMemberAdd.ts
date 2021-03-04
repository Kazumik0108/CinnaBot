import { GuildMember } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { handleGuildMemberJoinLog } from '../../handlers/guildMemberAdd/handleGuildMemberJoinLog';
import { handleWelcomeMessage } from '../../handlers/guildMemberAdd/handleWelcomeMessage';
export default async (client: CommandoClient, member: GuildMember) => {
  await handleGuildMemberJoinLog(member);
  if (member.user.bot) return;

  await handleWelcomeMessage(member);
};
