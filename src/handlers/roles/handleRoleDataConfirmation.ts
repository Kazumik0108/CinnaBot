import { Guild, Message, Role } from 'discord.js';
import { ReactionCallbacksYesNo, ReactionOptionsYesNo, RoleDataEmbedInputs } from '../../lib/common/interfaces';
import { createReactionCollector, createReactionOnCollect } from '../../lib/utils/collector/collectorReaction';

export const handleRoleDataConfirmation = async (
  message: Message,
  target: Message,
  embed: RoleDataEmbedInputs,
  type: 'add' | 'update' | 'delete',
) => {
  const options: ReactionOptionsYesNo = {
    yes: '👍',
    no: '👎',
  };

  const collector = await createReactionCollector(message, target, options);

  const guild = <Guild>message.guild;
  const callbacks: ReactionCallbacksYesNo = {
    yes: async () => {
      switch (type) {
        case 'add': {
          const role = await guild.roles
            .create({ data: embed.roleData })
            .catch((e) => console.log('Failed to create a role: ', e));
          (await message.reply(`Successfully created the role ${role}.`)).delete({ timeout: 5 * 1000 });
          break;
        }
        case 'delete': {
          const role = <Role>guild.roles.cache.find((r) => r.name == embed.roleData.name);
          await role.delete().catch((e) => console.log('Failed to delete a role: ', e));
          (await message.reply(`Succcessfully deleted the role ${role.name}.`)).delete({ timeout: 5 * 1000 });
          break;
        }
        case 'update': {
          const role = <Role>guild.roles.cache.find((r) => r.name == embed.roleData.name);
          await role.edit(embed.roleData).catch((e) => console.log('Failed to edit a role: ', e));
          (await message.reply(`Successfully edited the role ${role.name}.`)).delete({ timeout: 5 * 1000 });
          break;
        }
      }
      collector.stop();
    },
    no: async () => {
      (await message.reply('Canceling the command.')).delete({ timeout: 5 * 1000 });
      collector.stop();
    },
  };

  await createReactionOnCollect(collector, options, callbacks);
};
