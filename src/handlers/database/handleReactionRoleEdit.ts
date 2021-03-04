import { MessageReaction, User } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { Connection } from 'typeorm';
import { ReactionRole } from '../../entity/ReactionRole';
import { ReactionOptionsYesNo } from '../../lib/common/interfaces';
import { reactionOptionsFilter } from '../../lib/utils/collector/filterReaction';
import { handleReactionEdit } from './handleReactionEdit';

export const handleReactionRoleEdit = async (rrole: ReactionRole, conn: Connection, message: CommandoMessage) => {
  const enabled = rrole.enabled ? 'enabled' : 'not enabled';
  const change = rrole.enabled ? 'Disable' : 'Enable';
  const prompt = await message.reply(
    `The role @${rrole.name} is ${enabled} as a reaction role in this guild. ${change} it?`,
  );

  const options: ReactionOptionsYesNo = {
    yes: '👍',
    no: '👎',
  };
  for (const option of Object.values(options) as string[]) {
    await prompt.react(option);
  }

  const filter = (react: MessageReaction, user: User) =>
    reactionOptionsFilter({ message: message, reaction: react, user: user, options: options });
  const collector = prompt.createReactionCollector(filter, { time: 15 * 1000 });

  collector.on('collect', async (react: MessageReaction) => {
    if (react.emoji.name == options.yes) {
      // if (rrole.reaction == undefined)
      if (!rrole.reaction) {
        await handleReactionEdit(rrole, conn, message);
      }
      //   await conn
      //     .createQueryBuilder()
      //     .update(ReactionRole)
      //     .set({ enabled: !rrole.enabled })
      //     .where('id = :id', { id: rrole.id })
      //     .execute();
      //   (await message.say(`The reaction role @${rrole.name} has successfully been set to ${!rrole.enabled}.`))
      //     .delete({
      //       timeout: 10 * 1000,
      //     })
      //     .catch((e) => console.log('Failed to delete the reaction role update message: ', e));
      //   collector.stop();
      //   return;
      // }

      // (await message.say('Canceling the command.')).delete({ timeout: 5 * 1000 });
      // collector.stop();
    }
  });

  collector.on('end', () =>
    prompt.delete({ timeout: 5 * 1000 }).catch((e) => console.log('Failed to delete the prompt message: ', e)),
  );
};
