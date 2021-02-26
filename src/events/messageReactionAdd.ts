import { GuildMember, MessageReaction, Role, User } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { allReceptionMessages } from '../info/server/reception';

const checkReactionRole = (reaction: MessageReaction, user: User) => {
  const guild = reaction.message.guild;
  if (guild == null) return;

  const embeds = reaction.message.embeds;
  if (embeds.length == 0) return;

  const reactionMessage = allReceptionMessages.find((msg) => msg.embed.title === embeds[0].title);
  if (reactionMessage == undefined || reactionMessage?.channelID != reaction.message.channel.id) return;

  const reactionEmote = reactionMessage.reactions.find((emote) => emote.id == reaction.emoji.id);
  if (reactionEmote == undefined) {
    if (reaction.emoji.id == null) throw Error(`Could not remove the reaction ${reaction.emoji.name}`);
    reaction.message.reactions.cache.get(reaction.emoji.id)?.remove();
    return;
  }

  const role = guild.roles.cache.get(reactionEmote.roleID);
  const guildMember = guild.members.cache.get(user.id);
  if (role == undefined || guildMember == undefined) return;

  updateGuildMember(role, guildMember);
  reaction.users.remove(user.id);
};

const updateGuildMember = (role: Role, guildMember: GuildMember) => {
  const hasRole = guildMember.roles.cache.get(role.id);

  if (hasRole == undefined) {
    try {
      guildMember.roles.add(role);
    } catch (error) {
      console.log(`Failed to add the role ${role.name} to ${guildMember.user.username}: `, error);
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return;
    }
  }

  try {
    guildMember.roles.remove(role);
  } catch (error) {
    console.log(`Failed to remove the role ${role.name} from ${guildMember.user.username}: `, error);
  }
};

export default async (client: CommandoClient, partialReaction: MessageReaction, user: User) => {
  if (user.bot) return;

  let reaction = partialReaction;
  try {
    if (partialReaction.partial) {
      reaction = await partialReaction.fetch();
    }
  } catch (e) {
    console.log('Sth went wrong...', e);
  }

  checkReactionRole(reaction, user);
};
