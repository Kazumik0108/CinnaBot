import { HEX_DIGIT, HEX_COLOR } from '../../common/regex';

const replaceHexShortLong = (substring: string): string => {
  return substring.concat(substring);
};

const convertHexShortLong = (colorShort: string): string => {
  return colorShort.replace(HEX_DIGIT, replaceHexShortLong);
};

export const hexColorParser = (color: string): string | null => {
  const matches = color.match(HEX_COLOR);
  if (matches == null) return null;

  const match = matches[0];
  if (match.length == 7) return match;

  return convertHexShortLong(match);
};
