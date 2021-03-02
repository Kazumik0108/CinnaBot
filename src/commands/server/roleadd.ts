import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

import { DEFAULT_ROLE_DATA } from '../../functions/DEFAULT_ROLE';
import { getGuildRole, GetGuildRoleOptions } from '../../functions/guildFilters';
import { handleRoleDataEmbed, RoleDataEmbedInputs } from '../../handlers/roles/handleRoleData';
// eslint-disable-next-line prettier/prettier
import { handleRoleDataConfirmation, RoleDataConfirmationOptions } from '../../handlers/roles/handleRoleDataConfirmation';
import { handleRoleDataEdit } from '../../handlers/roles/handleRoleDataEdit';
import { RoleDataArgs, roleDataEditParser } from '../../parsers/roleDataEditParser';

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
          validate: (name: string, m: Message) => {
            const options: GetGuildRoleOptions = {
              message: m,
              property: name,
            };
            const role = getGuildRole(options);
            return role == null ? true : false;
          },
          error: 'A role with this already exists in this server. Try another name.',
        },
        {
          key: 'args',
          prompt: stripIndents`
            Specify any other options for the role using the key phrases below, or \`default\` to use the default role settings. Separate arguments with commas. Specified permissions are to be added to or deleted from default role permissions. 
            \`\`\`
            color <hex color>
            hoist <true/false>
            position <number>
            perm add <perm>
            perm del <perm>

            ---EXAMPLE---
            color #aa01bb, hoist true, position 3, perm add manage_roles manage_channels, perm del create_instant_invite
            \`\`\``,
          type: 'string',
          validate: (args: string) => {
            const match = args.match(/^(?:color|hoist|position|perm add|perm del|default)/);
            return match != null ? true : false;
          },
          parse: (args: string, m: Message) => roleDataEditParser(args, m),
        },
      ],
    });
  }

  async run(message: CommandoMessage, { name, args }: PromptArgs) {
    let data = DEFAULT_ROLE_DATA(name);
    data = args.default == true ? data : await handleRoleDataEdit(data, args);
    const options: RoleDataEmbedInputs = {
      message: message,
      roleData: data,
    };
    const embed = await handleRoleDataEmbed(options);
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
