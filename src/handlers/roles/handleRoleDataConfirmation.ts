import { MessageReaction, User, Guild, Role } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { ReactionOptionsYesNo, RoleDataConfirmationOptions } from '../../lib/common/interfaces';
import { reactionOptionsFilter } from '../../lib/utils/collector/filterReaction';

export const handleRoleDataConfirmation = async (message: CommandoMessage, confirm: RoleDataConfirmationOptions) => {
  const options: ReactionOptionsYesNo = {
    yes: '👍',
    no: '👎',
  };
  for (const option of Object.values(options) as string[]) {
    await confirm.watch.react(option);
  }

  const filter = (react: MessageReaction, user: User) =>
    reactionOptionsFilter({ message: message, user: user, reaction: react, options: options });
  const collector = confirm.watch.createReactionCollector(filter, { time: 15 * 1000 });

  collector.on('collect', async (react: MessageReaction) => {
    const guild = <Guild>message.guild;
    if (react.emoji.name == options.yes) {
      switch (confirm.type) {
        case 'add': {
          const role = await guild.roles
            .create({ data: confirm.options.roleData })
            .catch((e) => console.log('Failed to create a role: ', e));
          (await message.say(`Successfully created the role ${role}.`)).delete({ timeout: 5 * 1000 });
          break;
        }
        case 'delete': {
          const role = <Role>guild.roles.cache.find((r) => r.name == confirm.options.roleData.name);
          await role.delete().catch((e) => console.log('Failed to delete a role: ', e));
          (await message.say(`Succcessfully deleted the role ${role.name}.`)).delete({ timeout: 5 * 1000 });
          break;
        }
        case 'update': {
          const role = <Role>guild.roles.cache.find((r) => r.name == confirm.options.roleData.name);
          await role.edit(confirm.options.roleData).catch((e) => console.log('Failed to edit a role: ', e));
          (await message.say(`Successfully edited the role ${role.name}.`)).delete({ timeout: 5 * 1000 });
          break;
        }
      }

      collector.stop();
      return;
    }
    (await message.say('Canceling the command.')).delete({ timeout: 5 * 1000 });
    collector.stop();
  });
};
