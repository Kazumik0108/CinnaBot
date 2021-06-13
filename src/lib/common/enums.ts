/* eslint-disable no-shadow */
export enum ClientEvents {
  channelCreate = 'channelCreate',
  channelDelete = 'channelDelete',
  channelPinsUpdate = 'channelPinsUpdate',
  channelUpdate = 'channelUpdate',
  debug = 'debug',
  emojiCreate = 'emojiCreate',
  emojiDelete = 'emojiDelete',
  emojiUpdate = 'emojiUpdate',
  error = 'error',
  guildBanAdd = 'guildBanAdd',
  guildBanRemove = 'guildBanRemove',
  guildCreate = 'guildCreate',
  guildDelete = 'guildDelete',
  guildIntegrationsUpdate = 'guildIntegrationsUpdate',
  guildMemberAdd = 'guildMemberAdd',
  guildMemberAvailable = 'guildMemberAvailable',
  guildMemberRemove = 'guildMemberRemove',
  guildMembersChunk = 'guildMembersChunk',
  guildMemberSpeaking = 'guildMemberSpeaking',
  guildMemberUpdate = 'guildMemberUpdate',
  guildUnavailable = 'guildUnavailable',
  guildUpdate = 'guildUpdate',
  invalidated = 'invalidated',
  inviteCreate = 'inviteCreate',
  inviteDelete = 'inviteDelete',
  message = 'message',
  messageDelete = 'messageDelete',
  messageDeleteBulk = 'messageDeleteBulk',
  messageReactionAdd = 'messageReactionAdd',
  messageReactionRemove = 'messageReactionRemove',
  messageReactionRemoveAll = 'messageReactionRemoveAll',
  messageReactionRemoveEmoji = 'messageReactionRemoveEmoji',
  messageUpdate = 'messageUpdate',
  presenceUpdate = 'presenceUpdate',
  rateLimit = 'rateLimit',
  ready = 'ready',
  roleCreate = 'roleCreate',
  roleDelete = 'roleDelete',
  roleUpdate = 'roleUpdate',
  shardDisconnect = 'shardDisconnect',
  shardError = 'shardError',
  shardReady = 'shardReady',
  shardReconnecting = 'shardReconnecting',
  shardResume = 'shardResume',
  typingStart = 'typingStart',
  userUpdate = 'userUpdate',
  voiceStateUpdate = 'voiceStateUpdate',
  warn = 'warn',
  webhookUpdate = 'webhookUpdate',
  properties = 'properties',
}

export enum RolePermissions {
  CREATE_INSTANT_INVITE = 'CREATE_INSTANT_INVITE',
  KICK_MEMBERS = 'KICK_MEMBERS',
  BAN_MEMBERS = 'BAN_MEMBERS',
  ADMINISTRATOR = 'ADMINISTRATOR',
  MANAGE_CHANNELS = 'MANAGE_CHANNELS',
  MANAGE_GUILD = 'MANAGE_GUILD',
  ADD_REACTIONS = 'ADD_REACTIONS',
  VIEW_AUDIT_LOG = 'VIEW_AUDIT_LOG',
  PRIORITY_SPEAKER = 'PRIORITY_SPEAKER',
  STREAM = 'STREAM',
  VIEW_CHANNEL = 'VIEW_CHANNEL',
  SEND_MESSAGES = 'SEND_MESSAGES',
  SEND_TTS_MESSAGES = 'SEND_TTS_MESSAGES',
  MANAGE_MESSAGES = 'MANAGE_MESSAGES',
  EMBED_LINKS = 'EMBED_LINKS',
  ATTACH_FILES = 'ATTACH_FILES',
  READ_MESSAGE_HISTORY = 'READ_MESSAGE_HISTORY',
  MENTION_EVERYONE = 'MENTION_EVERYONE',
  USE_EXTERNAL_EMOJIS = 'USE_EXTERNAL_EMOJIS',
  VIEW_GUILD_INSIGHTS = 'VIEW_GUILD_INSIGHTS',
  CONNECT = 'CONNECT',
  SPEAK = 'SPEAK',
  MUTE_MEMBERS = 'MUTE_MEMBERS',
  DEAFEN_MEMBERS = 'DEAFEN_MEMBERS',
  MOVE_MEMBERS = 'MOVE_MEMBERS',
  USE_VAD = 'USE_VAD',
  CHANGE_NICKNAME = 'CHANGE_NICKNAME',
  MANAGE_NICKNAMES = 'MANAGE_NICKNAMES',
  MANAGE_ROLES = 'MANAGE_ROLES',
  MANAGE_WEBHOOKS = 'MANAGE_WEBHOOKS',
  MANAGE_EMOJIS = 'MANAGE_EMOJIS',
}

export enum EmbedInputs {
  title = 'title',
  description = 'description',
  color = 'color',
  image = 'image',
  thumbnail = 'thumbnail',
  json = 'json',
}

export enum Entities {
  Channel = 'channel',
  Embed = 'embed',
  Guild = 'guild',
  Reaction = 'reaction',
  Role = 'role',
}
