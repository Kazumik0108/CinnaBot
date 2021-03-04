import { ColorConvertOptions } from '../../common/interfaces';

const decToHex = (input: string) => {
  let output = parseInt(input, 10).toString(16).toUpperCase();
  while (output.length < 6) {
    output = '0'.concat(output);
    output = output.startsWith('#') ? output : '#'.concat(output);
  }
  return output;
};

const hexToDec = (input: string) => {
  let output: string | number = input.startsWith('#') ? parseInt(input.slice(1), 16) : parseInt(input, 16);
  output = String(output);
  return output;
};

export const convertColor = ({ input, option }: ColorConvertOptions) => {
  const output = option == 'decToHex' ? decToHex(input) : hexToDec(input);
  return output;
};
