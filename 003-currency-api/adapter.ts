import axios, { AxiosPromise } from "axios";
import * as dayjs from "dayjs";
import { Dayjs } from "dayjs";
import { map, assoc } from "rambdax";
type Currency =
  | "BGN"
  | "NZD"
  | "ILS"
  | "RUB"
  | "CAD"
  | "EUR"
  | "USD"
  | "PHP"
  | "CHF"
  | "ZAR"
  | "AUD"
  | "JPY"
  | "TRY"
  | "HKD"
  | "MYR"
  | "THB"
  | "HRK"
  | "NOK"
  | "IDR"
  | "DKK"
  | "CZK"
  | "HUF"
  | "GBP"
  | "MXN"
  | "KRW"
  | "ISK"
  | "SGD"
  | "BRL"
  | "PLN"
  | "INR"
  | "RON"
  | "CNY"
  | "SEK";

export type Options = {
  base?: Currency;
  symbols?: Currency[];
  base_url?: string;
  http?: {
    get<T = any>(url: string): Promise<{ data: any }> | AxiosPromise<T>;
  };
};

const defaultOptions: Options = {
  base_url: "https://api.exchangeratesapi.io",
  symbols: ["EUR", "GBP", "USD"],
  base: "EUR",
  http: axios
};

type JSONSingleResponse = {
  base: Currency;
  rates: SingleResponse;
  date: string;
};

type JSONMultipleResponse = {
  base: Currency;
  rates: { [key: string]: SingleResponse };
  date: string;
};
export type SingleResponse = { [key in Currency]?: number };

export type MultipleResponse = {
  [/** @type: Date YYYY-MM-DD */ key in string]?: SingleResponse
};

export type Adapter = {
  latest(): Promise<SingleResponse>;
  single(date: Dayjs): Promise<SingleResponse>;
  history(from: Dayjs, to?: Dayjs): Promise<MultipleResponse>;
};

const dateFormat = "YYYY-MM-DD";

export default function(options: Options = defaultOptions): Adapter {
  const { base, base_url, symbols, http } = { ...defaultOptions, ...options };

  const Url = (path: string, addOwnSymbol = false) => {
    const properSymbols = symbols.filter(b => b !== base).join(",");
    return `${base_url}/${path}?base=${base}&symbols=${properSymbols}`;
  };
  function addBaseCurrency(result: SingleResponse): SingleResponse {
    return { ...result, ...{ [base]: 1 } };
  }
  async function apiCallForSingle(path: string): Promise<SingleResponse> {
    const url = Url(path);
    const data = (await http.get(url)).data as JSONSingleResponse;
    return addBaseCurrency(data.rates);
  }

  const adapter: Adapter = {
    async latest(): Promise<SingleResponse> {
      return apiCallForSingle("latest");
    },
    async single(date: Dayjs): Promise<SingleResponse> {
      return apiCallForSingle(date.format(dateFormat));
    },

    async history(from: Dayjs, to = dayjs()): Promise<MultipleResponse> {
      if (from.startOf("day").isAfter(to)) {
        return adapter.history(to, from);
      }
      const startAt = from.format(dateFormat);
      const endAt = to.format(dateFormat);
      const url = Url("history") + `&start_at=${startAt}&end_at=${endAt}`;
      const data = (await http.get(url)).data as JSONMultipleResponse;

      return map(assoc(base, 1), data.rates);
    }
  };
  return adapter;
}
