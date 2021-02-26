export const ID_CHANNEL_REGEX = /(?<=<#)\d{18}(?=>)/g;
export const ID_ROLE_REGEX = /(?<=<@&)\d{18}(?=>)/g;
export const ID_USER_REGEX = /(?<=<@!*)\d{18}(?=>)/g;
export const ID_EMOJI_REGEX = /(?<=<a?:\w+:)\d{18}(?=>)/g;

export const NAME_EMOJI_REGEX = /(?<=<a?:)\w+(?=:\d{18}>)/g;
export const EMOJI_FORMAT_REGEX = /<a?:\w+:\d+>|(?<!\\):(\w+):/g;

export const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g;
export const HEX_SHORT_TO_LONG_REGEX = /[A-Fa-f0-9]{1}/g;
