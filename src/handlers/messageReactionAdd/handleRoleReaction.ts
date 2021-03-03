import { GuildMember, MessageReaction } from 'discord.js';

import { allReceptionMessages } from '../../info/server/reception';

export const handleReactionRole = (reaction: MessageReaction, guildMember: GuildMember) => {
  const embeds = reaction.message.embeds;
  if (embeds.length == 0) return;

  const embed = allReceptionMessages.find((m) => m.embed.title == embeds[0].title);
  if (embed == undefined || embed.channelID != reaction.message.channel.id) return;

  const validReaction = embed.reactions.find((e) => e.id == reaction.emoji.id);
  if (validReaction == undefined) {
    reaction.remove();
    return;
  }

  const guild = guildMember.guild;
  const role = guild.roles.cache.get(validReaction.roleID);
  if (role == undefined || guildMember == undefined) return;

  const hasRole = guildMember.roles.cache.get(role.id);
  if (hasRole == undefined) {
    guildMember.roles
      .add(role)
      .catch((e: Error) => console.log(`Failed to add the role ${role.name} to ${guildMember.nickname}`, e));
  } else {
    guildMember.roles
      .remove(role)
      .catch((e: Error) => console.log(`Failed to remove the role ${role.name} from ${guildMember.nickname}`, e));
  }

  reaction.users.remove(guildMember.id);
};
