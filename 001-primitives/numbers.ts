export const incrementedByOne = (n: number): number => {
  return n + 1;
};

export const sum = (a: number, b: number): number => {
  return a + b;
};

export const sumArray = (...arr: number[]): number => {
  return arr.reduce(sum, 0);
};

export const divide = (n: number, divider: number): number => {
  return n / divider;
};
