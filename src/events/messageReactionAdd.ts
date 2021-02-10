// messageReactionAdd.ts
import { GuildMember, MessageReaction, Role, User } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { reactEmotes, reactMessages } from '../info/server/reactionroles';

const getRoleID = (reaction: MessageReaction): string | undefined => {
  const emote = reactEmotes.find((reactEmote) => (reaction.emoji.id === reactEmote.id ? true : false));
  if (emote != undefined) return emote.roleID;
};

const updateGuildMember = (role: Role, guildMember: GuildMember) => {
  const hasRole = guildMember.roles.cache.get(role.id);
  if (hasRole == undefined) {
    guildMember.roles
      .add(role)
      .catch((error) => console.log(`Failed to add the role ${role.name} to ${guildMember.user.username}: `, error));
  } else {
    guildMember.roles
      .remove(role)
      .catch((error) =>
        console.log(`Failed to remove the role ${role.name} from ${guildMember.user.username}: `, error),
      );
  }
};

const removeReactions = (reaction: MessageReaction) => {
  const roleReactions = reaction.message.reactions.cache.filter((roleReaction) => roleReaction.users.cache.size > 0);
  roleReactions.forEach((roleReaction) => {
    const otherUsers = roleReaction.users.cache.filter((user) => user.id != roleReaction.message.author.id);
    otherUsers.forEach((otherUser) => {
      roleReaction.users
        .remove(otherUser.id)
        .catch((error) =>
          console.log(`Failed to remove the reaction ${roleReaction.emoji.name} by ${otherUser.username}: `, error),
        );
    });
  });
};

export const main = (client: CommandoClient, reaction: MessageReaction) => {
  if (reaction.me) return;

  const isRoleMessage = reactMessages.some((reactMessage) => reactMessage.id === reaction.message.id);
  if (!isRoleMessage) return;
  const guild = reaction.message.guild;
  if (guild == null) return;

  const roleID = getRoleID(reaction);
  if (roleID == undefined) return reaction.message.reactions.cache.get(reaction.emoji.id as string)?.remove();

  const role = guild.roles.cache.get(roleID);
  const guildMember = guild.members.cache.get((reaction.users.cache.first() as User).id);
  if (role == undefined || guildMember == undefined) return;
  updateGuildMember(role, guildMember);
  removeReactions(reaction);
};
