import { HEX_COLOR } from '../../types/common/regex';

export const hexColorValidator = (color: string): boolean => {
  const matches = color.match(HEX_COLOR);
  return matches != null ? true : false;
};
