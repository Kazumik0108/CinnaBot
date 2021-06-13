export const assertUnreachable = (x: never) => {
  throw new Error('An error has occured with variable: ' + x);
};
