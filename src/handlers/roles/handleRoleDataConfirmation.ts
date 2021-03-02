import { Guild, Message, MessageReaction, User } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';

import { reactionFilter, ReactionOptionsYesNo } from '../../functions/collectorFilters';
import { RoleDataEmbedInputs } from './handleRoleData';

export interface RoleDataConfirmationOptions {
  options: RoleDataEmbedInputs;
  watch: Message | CommandoMessage;
  type: 'add' | 'update' | 'delete';
}

export const handleRoleDataConfirmation = async (message: CommandoMessage, confirm: RoleDataConfirmationOptions) => {
  const options: ReactionOptionsYesNo = {
    yes: '👍',
    no: '👎',
  };
  for (const option of Object.values(options) as string[]) {
    await confirm.watch.react(option);
  }

  const filter = (r: MessageReaction, u: User) => reactionFilter(message, options, r, u);
  const collector = confirm.watch.createReactionCollector(filter, { time: 15 * 1000 });

  collector.on('collect', async (r: MessageReaction) => {
    const guild = <Guild>message.guild;
    if (r.emoji.name == options.yes) {
      guild.roles.create({ data: confirm.options.roleData });
      (await message.say(`Successfully created the role ${confirm.options.roleData.name}.`)).delete({
        timeout: 5 * 1000,
      });
      collector.stop();
      return;
    }
    (await message.say('Canceling the command.')).delete({ timeout: 5 * 1000 });
    collector.stop();
  });
};
