// gem.ts
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { gems, gemAliases } from '../../info/wiki/gems';

interface promptArgs {
  name: string;
}

export default class gemInfo extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'gem',
      group: 'wiki',
      memberName: 'gem',
      description: 'Sends the information for the specified gem',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'name',
          prompt: 'Specify a gem name below.\n```\n' + gems.join('\n') + '```',
          type: 'string',
          oneOf: gemAliases,
        },
      ],
    });
  }

  async run(message: CommandoMessage, { name }: promptArgs) {
    const inputGem = gems.find((gem) => gem.aliases.find((alias) => alias == name));
    if (inputGem == undefined) {
      (await message.reply(`there are no gems with the name \`${name}\`.`)).delete({ timeout: 5000 });
      return null;
    }
    await message.say(inputGem.embed);

    await message.delete({ timeout: 2000 });

    return null;
  }
}
