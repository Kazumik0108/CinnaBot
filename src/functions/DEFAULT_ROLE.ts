import { Client, ColorResolvable, Guild, PermissionResolvable, Role, RoleData, SnowflakeUtil } from 'discord.js';
import { CommandoClient, CommandoGuild } from 'discord.js-commando';

export const DEFAULT_ROLE_DATA = (client: CommandoClient | Client, guild: CommandoGuild | Guild, name: string) => {
  const data: RoleData = {
    name: name,
    color: <ColorResolvable>0,
    hoist: false,
    position: 1,
    mentionable: false,
    permissions: <PermissionResolvable>[
      'ADD_REACTIONS',
      'ATTACH_FILES',
      'CHANGE_NICKNAME',
      'CONNECT',
      'CREATE_INSTANT_INVITE',
      'EMBED_LINKS',
      'READ_MESSAGE_HISTORY',
      'SEND_MESSAGES',
      'SPEAK',
      'STREAM',
      'USE_EXTERNAL_EMOJIS',
      'USE_VAD',
      'VIEW_CHANNEL',
    ],
  };
  return data;
};
