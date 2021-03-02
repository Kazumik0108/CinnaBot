import { PermissionString, RoleData } from 'discord.js';

import { RoleDataArgs } from '../../parsers/roleDataEditParser';

export const handleRoleDataEdit = (data: RoleData, args: RoleDataArgs) => {
  const dataEdit = data;
  if (args.color) {
    dataEdit.color = args.color;
  }
  if (args.hoist) {
    dataEdit.hoist = args.hoist;
  }
  if (args.position) {
    dataEdit.position = args.position;
  }
  if (args.permAdd) {
    for (const p of args.permAdd) {
      if (p) {
        const perm = <PermissionString>p;
        const perms = <PermissionString[]>dataEdit.permissions;
        if (!perms.includes(perm)) {
          (<PermissionString[]>dataEdit.permissions).push(perm);
        }
      }
    }
  }
  if (args.permDel) {
    for (const p of args.permDel) {
      if (p) {
        const perm = <PermissionString>p;
        const perms = <PermissionString[]>dataEdit.permissions;
        if (perms.includes(perm)) {
          const pos = perms.indexOf(perm);
          (<PermissionString[]>dataEdit.permissions).splice(pos, 1);
        }
      }
    }
  }
  (dataEdit.permissions as PermissionString[]).sort();
  return dataEdit;
};
