import test from "ava";
import * as numbers from "./numbers";

test("incrementation byOne", t => {
  const result = numbers.incrementedByOne(1);
  t.is(result, 2, "Incremented number should equals 2");
});

test("sum two values", t => {
  const result = numbers.sum(3, 4);
  t.is(result, 7);
});

test("sum array of 8 elements", t => {
  const result = numbers.sumArray(-1, -2, 3, 5, 10, -2, -3, -1);
  t.is(result, 9);
});

test("sum array of 4 elements", t => {
  const result = numbers.sumArray(1, 2, 3, 4);
  t.is(result, 7);
});

[[4, 2, 2], [5, 1, 5], [3, 6, 0.5], [-1, 10, -0.1]].map(
  ([n, divider, aResult]) => {
    test(`divide ${n}/${divider} should equals = ${aResult}`, t => {
      const result = numbers.divide(n, divider);
      t.is(result, aResult);
    });
  }
);
