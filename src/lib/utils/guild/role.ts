import { Guild, Role } from 'discord.js';

export function getGuildRole(property: string, guild: Guild) {
  const role = guild.roles.cache.find((r) => r.id == property || r.name == property);
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
