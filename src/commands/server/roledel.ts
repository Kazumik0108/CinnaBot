// roledel.ts
import { Guild, GuildMember, MessageEmbed, MessageReaction, Role } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

interface promptArgs {
  roleName: string;
}

function getMessageEmbed(role: Role) {
  const embedMessage = new MessageEmbed()
    .setTitle('Delete Role')
    .setDescription(`<@&${role.id}>`)
    .setColor(role.hexColor)
    .addField('Color', role.hexColor.toUpperCase(), true)
    .addField('Admin', role.permissions.toArray().includes('ADMINISTRATOR').toString().toUpperCase(), true)
    .addField('Permissions', `${role.permissions.toArray().join('\n')}`);
  return embedMessage;
}

export default class addrole extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'roledel',
      group: 'server',
      memberName: 'roledel',
      description: 'Deletes the specified role from the server.',
      guildOnly: true,
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES'],
      format: '+roledel <roleName>',
      examples: ['+roledel Gems'],
      args: [
        {
          key: 'roleName',
          prompt: 'Specify the name of the role you want to delete.',
          type: 'string',
        },
      ],
    });
  }

  async run(message: CommandoMessage, { roleName }: promptArgs): Promise<null> {
    // Abort command if no role exists with the specified name in the server
    const roles = (message.guild as Guild).roles.cache.filter((guildRole) => guildRole.name === roleName);
    if (roles.size === 0) {
      message
        .reply(`there is no role with the name \`${roleName}\`.`)
        .then((reply) => reply.delete({ timeout: 10 * 1000 }));
      return null;
    }
    const role = roles.first() as Role;

    // ask the user to confirm deleting the role
    const embedMessage = getMessageEmbed(role!);
    const reply = await message.reply(
      'verify the role you want to delete.\nReact with 👍 to delete the role. React with 👎 to cancel the command.',
    );
    const msg = await message.say(embedMessage);
    msg.react('👍').then(() => msg.react('👎'));

    const filter = (reaction: MessageReaction, user: GuildMember): boolean => {
      return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    msg
      .awaitReactions(filter, { max: 1, time: 10 * 1000, errors: ['time'] })
      .then((collected) => {
        const reaction = collected.first() as MessageReaction;
        if (reaction.emoji.name === '👍') {
          role
            .delete()
            .then(() =>
              message
                .reply(`the role \`${roleName}\` has successfully been deleted.`)
                .then((confirmMsg) => confirmMsg.delete({ timeout: 5000 })),
            )
            .catch((error) => message.say(error));
        } else {
          message.reply('canceling command.').then((cancelMsg) => cancelMsg.delete({ timeout: 3000 }));
        }
      })
      .catch(() => {
        message.reply('the command has timed out.').then((abortMsg) => abortMsg.delete({ timeout: 5000 }));
      })
      .finally(() => {
        reply.delete({ timeout: 3000 });
        msg.delete({ timeout: 3000 });
      });

    return null;
  }
}
