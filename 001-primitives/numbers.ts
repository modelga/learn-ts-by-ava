export const incrementedByOne = (n: number): number => {
  return n + 1;
};

export const sum = (a: number, b: number): number => {
  return a + b;
};

export const sumArray = (...arr: number[]): number => {
  let res = 0;
  for (const n of arr) {
    res = res + n;
  }
  return res;
};

export const divide = (n: number, divider: number): number => {
  return null;
};
