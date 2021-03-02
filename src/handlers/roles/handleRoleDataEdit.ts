import { PermissionString, RoleData } from 'discord.js';

import { RoleDataArgs } from '../../parsers/roleDataEditParser';

export const handleRoleDataEdit = (data: RoleData, args: RoleDataArgs) => {
  const dataEdit = data;
  for (const [k, v] of Object.entries(args)) {
    if (v == null) continue;
    switch (k) {
      case 'color': {
        dataEdit.color = <string>v;
        break;
      }
      case 'hoist': {
        dataEdit.hoist = <boolean>v;
        break;
      }
      case 'position': {
        dataEdit.position = <number>v;
        break;
      }
      case 'permAdd': {
        for (const p of v) {
          const perm = <PermissionString>p;
          const perms = dataEdit.permissions as PermissionString[];
          if (!perms.includes(perm)) {
            (dataEdit.permissions as PermissionString[]).push(perm);
          }
        }
        break;
      }
      case 'permDel': {
        for (const p of v) {
          const perm = <PermissionString>p;
          const perms = dataEdit.permissions as PermissionString[];
          if (perms.includes(perm)) {
            const pos = perms.indexOf(perm);
            (dataEdit.permissions as PermissionString[]).splice(pos, 1);
          }
        }
        break;
      }
    }
  }
  (dataEdit.permissions as PermissionString[]).sort();
  return dataEdit;
};
