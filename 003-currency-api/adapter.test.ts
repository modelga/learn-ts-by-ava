import test from "ava";
import * as dayjs from "dayjs";
import Adapter, { MultipleResponse, SingleResponse } from "./adapter";
import { map } from "rambdax";

test("should return list of rates for today", async t => {
  const adapter = Adapter({ base: "EUR" });
  const data = await adapter.latest();
  t.is(data.EUR, 1);
});

test("should return list of rates for yesterday", async t => {
  const adapter = Adapter({ base: "EUR" });
  const yesterday = dayjs().subtract(1, "day");
  const data = await adapter.single(yesterday);
  t.is(data.EUR, 1);
});

test("should return list of rates for today for specified currencies", async t => {
  // given
  const adapter = Adapter({ base: "EUR", symbols: ["GBP", "JPY", "CHF"] });
  // when
  const data = await adapter.latest();
  // then
  t.is(data.EUR, 1);
  t.truthy(data.GBP);
  t.truthy(data.JPY);
  t.truthy(data.CHF);
  t.falsy(data.PLN);
});

test("should return history of rates for today for specified currencies", async t => {
  const weekAgo = dayjs()
    .subtract(1, "week")
    .startOf("day");

  const adapter = Adapter({ base: "EUR", symbols: ["GBP", "JPY", "CHF"] });

  const data: MultipleResponse = await adapter.history(weekAgo);

  map<SingleResponse, void>((rates: SingleResponse, key) => {
    t.false(dayjs(key).isBefore(weekAgo));
    t.is(rates.EUR, 1);
    t.true(rates.JPY > 0);
    t.true(rates.CHF > 0);
    t.true(rates.GBP > 0);
  }, data);
});

test("should mock axios and create the url properly for latest", async t => {
  let invokedUrl;
  const http = {
    async get(url: string): Promise<any> {
      invokedUrl = url;
      return {
        data: { rates: {} }
      };
    }
  };
  const adapter = Adapter({
    base: "EUR",
    symbols: ["GBP", "JPY", "CHF"],
    base_url: "https://currency-service",
    http
  });

  await adapter.latest();
  t.is(
    invokedUrl,
    "https://currency-service/latest?base=EUR&symbols=GBP,JPY,CHF"
  );
});

test("should mock axios and create the url properly for single date", async t => {
  let invokedUrl;
  const http = {
    async get(url: string): Promise<any> {
      invokedUrl = url;
      return {
        data: { rates: {} }
      };
    }
  };
  const adapter = Adapter({
    base: "EUR",
    symbols: ["GBP", "JPY", "CHF"],
    base_url: "https://currency-service",
    http
  });

  const yesterday = dayjs().subtract(1, "day");
  await adapter.single(yesterday);
  const formatedDate = yesterday.format("YYYY-MM-DD");
  t.is(
    invokedUrl,
    `https://currency-service/${formatedDate}?base=EUR&symbols=GBP,JPY,CHF`
  );
});

test("should mock axios and create the url properly for history", async t => {
  let invokedUrl;
  const http = {
    async get(url: string): Promise<any> {
      invokedUrl = url;
      return {
        data: { rates: {} }
      };
    }
  };
  const adapter = Adapter({
    base: "EUR",
    symbols: ["GBP", "JPY", "CHF"],
    base_url: "https://currency-service",
    http
  });
  const weekAgo = dayjs().subtract(1, "week");

  await adapter.history(weekAgo);
  t.is(
    invokedUrl,
    "https://currency-service/history?base=EUR&symbols=GBP,JPY,CHF" +
      `&start_at=${weekAgo.format("YYYY-MM-DD")}` +
      `&end_at=${dayjs().format("YYYY-MM-DD")}`
  );
});
