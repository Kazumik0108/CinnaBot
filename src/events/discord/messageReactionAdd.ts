import { MessageReaction, User } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { handleReactionRole } from '../../handlers/messageReactionAdd/handleRoleReaction';

export default async (client: CommandoClient, partial: MessageReaction, user: User) => {
  if (user.bot) return;

  let reaction = partial;
  if (partial.partial) {
    reaction = await partial.fetch();
  }

  const guild = reaction.message.guild;
  if (guild == null) return;

  const guildMember = guild.member(user);
  if (guildMember == null) return;

  await handleReactionRole(reaction, guildMember);
};
