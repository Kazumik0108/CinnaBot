import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { DEFAULT_ROLE_DATA } from '../../functions/DEFAULT_ROLE';
import { roleArgsPrompt, handleRoleDataArgs } from '../../handlers/roles/handleRoleDataArgs';
import { handleRoleDataConfirmation } from '../../handlers/roles/handleRoleDataConfirmation';
import { handleRoleDataEdit } from '../../handlers/roles/handleRoleDataEdit';
import { RoleDataEmbedInputs, handleRoleDataEmbed } from '../../handlers/roles/handleRoleDataEmbed';
import { RoleDataArgs, RoleDataConfirmationOptions } from '../../lib/types/common/interfaces';
import { getGuildRole } from '../../lib/utils/guildFilters';

interface PromptArgs {
  name: string;
  args: RoleDataArgs;
}

export default class roleadd extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'roleadd',
      group: 'server',
      memberName: 'roleadd',
      description: 'Creates a named role within the server.',
      guildOnly: true,
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES'],
      format: '+roleadd <roleName> <roleColor> <rolePerm>,<rolePerm>',
      examples: ['+roleadd Gems', '+roleadd Gems #012345', '+roleadd Gems #012345 MANAGE_CHANNELS, MANAGE_EMOJIS'],
      args: [
        {
          key: 'name',
          prompt: 'Specify the name of the role you would like to create.',
          type: 'string',
          validate: (name: string, m: CommandoMessage) => {
            const role = getGuildRole({ message: m, property: name });
            return role == null ? true : false;
          },
          error: 'A role with this already exists in this server. Try another name.',
        },
        {
          key: 'args',
          prompt: roleArgsPrompt(),
          type: 'string',
          validate: (args: string) => {
            const match = args.match(/^(?:color|hoist|position|perm add|perm del|default)/);
            return match != null ? true : false;
          },
          parse: (args: string, m: CommandoMessage) => handleRoleDataArgs(args, m),
        },
      ],
    });
  }

  async run(message: CommandoMessage, { name, args }: PromptArgs) {
    let data = DEFAULT_ROLE_DATA(name);
    data = args.default == true ? data : handleRoleDataEdit(data, args);
    const options: RoleDataEmbedInputs = {
      message: message,
      roleData: data,
    };

    const embed = handleRoleDataEmbed(options);
    const reply = await message.reply('Confirm with a reaction to create the role or abort the command.', embed);

    const confirm: RoleDataConfirmationOptions = {
      options: options,
      watch: reply,
      type: 'add',
    };
    await handleRoleDataConfirmation(message, confirm);
    return null;
  }
}
