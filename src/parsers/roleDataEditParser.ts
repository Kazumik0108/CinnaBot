import { ColorResolvable, Guild, Message, Role } from 'discord.js';

import { hexColorParser, hexColorValidator } from '../functions/embedFilters';
import ROLE_PERMS = require('../info/ROLE_PERMS.json');

export interface RoleDataArgs {
  default: boolean;
  cancel: boolean;
  color?: ColorResolvable | null;
  hoist?: boolean | null;
  position?: number | null;
  permAdd?: Array<string | null> | null;
  permDel?: Array<string | null> | null;
}

export const roleDataEditParser = async (contents: string, message: Message) => {
  const args = contents.split(/,/g).map((s) => s.trim());
  const def = args[0].toLowerCase() == 'default' ? true : false;
  const cancel = args[0].toLowerCase() == 'cancel' ? true : false;
  const parsed: RoleDataArgs = {
    default: def,
    cancel: cancel,
  };
  if (parsed.default == true || parsed.cancel == true) return parsed;

  for (const arg of args) {
    if (!arg.startsWith('perm add') && !arg.startsWith('perm del')) {
      const match = arg.match(/(?<=(color|hoist|position)\s+)#*\w+/);
      if (match == null) continue;

      let value: string | number | boolean | null = match[0];
      const key = match[1];
      switch (key) {
        case 'color': {
          if (hexColorValidator(value)) {
            value = hexColorParser(value);
          } else {
            value = null;
          }
          parsed.color = value;
          break;
        }
        case 'hoist': {
          if (['true', 'false'].includes(value.toLowerCase())) {
            value = value == 'true';
          } else {
            value = null;
          }
          parsed.hoist = value;
          break;
        }
        case 'position': {
          const botRole = <Role>(
            (<Guild>message.guild).me?.roles.cache.filter((r) => r.permissions.has('MANAGE_ROLES')).first()
          );
          const maxPos = botRole.rawPosition;
          if (parseInt(value, 10) >= maxPos) {
            value = null;
          }
          parsed.position = value == null ? null : parseInt(value, 10);
          break;
        }
      }
    } else {
      const match = arg.match(/(?<=(perm add|perm del)\s+)(\w+(\s+\w+)*)+/);
      if (match == null) break;
      const permInputs = match[0].split(/\s+/g);
      const key = match[1];

      const perms = [];
      for (const perm of permInputs) {
        if (ROLE_PERMS.includes(perm.toUpperCase())) perms.push(perm.toUpperCase());
      }

      if (key == 'perm add') {
        parsed.permAdd = perms;
      } else {
        parsed.permDel = perms;
      }
    }
  }
  return parsed;
};
