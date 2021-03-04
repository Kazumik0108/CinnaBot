import { MessageReaction, User, Guild, Role } from 'discord.js';
import { ReactionOptionsYesNo, RoleDataConfirmationOptions } from '../../lib/common/interfaces';
import { reactionOptionsFilter } from '../../lib/utils/collector/filterReaction';

export const handleRoleDataConfirmation = async ({ message, options, target, type }: RoleDataConfirmationOptions) => {
  const filterOptions: ReactionOptionsYesNo = {
    yes: '👍',
    no: '👎',
  };

  for (const option of Object.values(filterOptions) as string[]) {
    await target.react(option);
  }

  const filter = (react: MessageReaction, user: User) =>
    reactionOptionsFilter({ message: message, user: user, reaction: react, options: filterOptions });
  const collector = target.createReactionCollector(filter, { time: 15 * 1000 });

  collector.on('collect', async (react: MessageReaction) => {
    const guild = <Guild>message.guild;
    if (react.emoji.name == filterOptions.yes) {
      switch (type) {
        case 'add': {
          const role = await guild.roles
            .create({ data: options.roleData })
            .catch((e) => console.log('Failed to create a role: ', e));
          (await message.reply(`Successfully created the role ${role}.`)).delete({ timeout: 5 * 1000 });
          break;
        }
        case 'delete': {
          const role = <Role>guild.roles.cache.find((r) => r.name == options.roleData.name);
          await role.delete().catch((e) => console.log('Failed to delete a role: ', e));
          (await message.reply(`Succcessfully deleted the role ${role.name}.`)).delete({ timeout: 5 * 1000 });
          break;
        }
        case 'update': {
          const role = <Role>guild.roles.cache.find((r) => r.name == options.roleData.name);
          await role.edit(options.roleData).catch((e) => console.log('Failed to edit a role: ', e));
          (await message.reply(`Successfully edited the role ${role.name}.`)).delete({ timeout: 5 * 1000 });
          break;
        }
      }

      collector.stop();
      return;
    }
    (await message.reply('Canceling the command.')).delete({ timeout: 5 * 1000 });
    collector.stop();
  });
};
