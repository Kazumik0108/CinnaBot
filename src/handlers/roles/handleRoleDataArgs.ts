import { stripIndents } from 'common-tags';
import { Guild, Role } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { RoleDataArgs } from '../../lib/types/common/interfaces';
import { RolePermissions } from '../../types';
import { hexColorParser } from '../server/handleEmbedMessageArgs';

export const rolePermissionsArray = () => {
  const events = Object.keys(RolePermissions);
  const columnOne = events.slice(0, Math.ceil(events.length / 2));
  const columnTwo = events.slice(Math.ceil(events.length / 2), events.length);

  const width = 30;
  const table = [];
  for (const i in columnOne) {
    let line = columnOne[i].padEnd(width, ' ');
    if (columnTwo[i]) line = line.concat(`| ${columnTwo[i]}`);
    table.push(line);
  }

  return table.join('\n');
};

export const roleArgsPrompt = () => stripIndents`
  Specify any other options for the role using the key phrases below, or \`default\` to use the default role settings. Separate arguments with commas.
  
  Entered permissions will be added to or deleted from default role permissions. The list of permissions are shown below.
  \`\`\`
  color <hex color>
  hoist <true/false>
  position <number>
  perm add <perm>
  perm del <perm>

  ---EXAMPLE---
  color #aa01bb, hoist true, position 3, perm add manage_roles manage_channels, perm del create_instant_invite

  ---PERMISSIONS---
  ${rolePermissionsArray()}
  \`\`\``;

export const handleRoleDataArgs = async (contents: string, m: CommandoMessage) => {
  const args = contents.split(/,/g).map((s) => s.trim());
  const def = args[0].toLowerCase() == 'default' ? true : false;
  const parsed: RoleDataArgs = {
    default: def,
  };
  if (parsed.default == true) return parsed;

  for (const arg of args) {
    if (!arg.startsWith('perm add') && !arg.startsWith('perm del')) {
      const match = arg.match(/(?<=(color|hoist|position)\s+)#*\w+/);
      if (match == null) continue;

      const value: string | number | boolean | null = match[0];
      const key = match[1];
      switch (key) {
        case 'color': {
          const hexColor = hexColorParser(value);
          if (hexColor) {
            parsed.color = hexColor;
          }
          break;
        }
        case 'hoist': {
          const hoist = ['true', 'false'].includes(value.toLowerCase());
          if (hoist) {
            parsed.hoist = hoist;
          }
          break;
        }
        case 'position': {
          const botRole = <Role>(
            (<Guild>m.guild).me?.roles.cache.filter((r) => r.permissions.has('MANAGE_ROLES')).first()
          );
          const maxPos = botRole.rawPosition;
          const pos = parseInt(value, 10);
          if (pos < maxPos) {
            parsed.position = pos;
            break;
          }
        }
      }
    } else {
      const match = arg.match(/(?<=(perm add|perm del)\s+)(\w+(\s+\w+)*)+/);
      if (match == null) continue;

      const permInputs = match[0].split(/\s+/g);
      const key = match[1];

      const perms = [];
      for (const perm of permInputs) {
        if (perm in RolePermissions) perms.push(perm.toUpperCase());
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
