import { HEX_COLOR } from '../../common/regex';

export const hexColorValidator = (color: string): boolean => {
  const matches = color.match(HEX_COLOR);
  return matches != null ? true : false;
};
