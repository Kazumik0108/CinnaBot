import { PermissionResolvable, RoleData } from 'discord.js';

export const defaultRole = (name: string) => {
  const data: RoleData = {
    name: name,
    color: '#000000',
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
