import { Guild, Role } from 'discord.js';
import { ROLE_ID } from '../../common/regex';

export function getGuildRole(property: string, guild: Guild) {
  const input = ROLE_ID.test(property) ? (property.match(ROLE_ID) as string[])[0] : property;
  const role = guild.roles.cache.find((r) => r.id == input || r.name == input);
  return role != undefined ? role : null;
}

export function isRole(role: unknown): role is Role {
  return role instanceof Role;
}

export function isGuildRole(role: unknown, guild: Guild): role is Role {
  if (!isRole(role)) return false;
  const roles = guild.roles.cache;
  return roles.some((r) => r.id == role.id);
}
