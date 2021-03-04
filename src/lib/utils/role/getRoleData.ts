import { Role, RoleData } from 'discord.js';

export const getRoleData = (role: Role) => {
  const data: RoleData = {
    name: role.name,
    color: role.hexColor,
    hoist: role.hoist,
    position: role.rawPosition,
    mentionable: role.mentionable,
    permissions: role.permissions.toArray(),
  };
  return data;
};
