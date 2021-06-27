export const CHANNEL_ID = /(?<=<#)\d{18}(?=>)/g;
export const ROLE_ID = /(?<=<@&)\d{18}(?=>)/g;
export const USER_ID = /(?<=<@!*)\d{18}(?=>)/g;

export const EMOJI = /<a?:\w+:\d{18}>/g;
export const EMOJI_NAME = /(?<=<a?:)\w+(?=:\d{18}>)/g;
export const EMOJI_ID = /(?<=<a?:\w+:)\d{18}(?=>)/g;
export const EMOJI_REPLACE = /<a?:\w+:\d+>|(?<!\\):(\w+):/g;

export const HEX_COLOR = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g;
export const HEX_DIGIT = /[A-Fa-f0-9]{1}/g;

export const REPLACE_ID = /<\d{18}>/g;
export const ANY_ID = /\d{18}/g;
