import {
  assertProviderFeatureSupported,
  getProviderCapabilities,
} from "stocks/shared/capabilities";
import stocks from "stocks";
import { StockRequestError } from "../../../src/errors";

type TestRuntime = typeof globalThis & {
  document?: unknown;
};

const runtime = globalThis as TestRuntime;
const originalDocument = runtime.document;

afterEach(() => {
  if (originalDocument === undefined) {
    delete runtime.document;
  } else {
    runtime.document = originalDocument;
  }
});

test("exposes provider capability table", () => {
  expect(stocks.getProviderCapabilities()).toEqual(getProviderCapabilities());
  expect(getProviderCapabilities()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        browser: expect.objectContaining({
          quote: { supported: true },
          search: { supported: true },
        }),
        source: "tencent",
      }),
      expect.objectContaining({
        browser: expect.objectContaining({
          quote: expect.objectContaining({ supported: false }),
          search: expect.objectContaining({ supported: false }),
        }),
        source: "sina",
      }),
    ])
  );
});

test("blocks unsupported browser provider features with a clear error", () => {
  runtime.document = { head: {} };

  expect(() => assertProviderFeatureSupported("sina", "quote")).toThrow(
    StockRequestError
  );
  expect(() => assertProviderFeatureSupported("sina", "quote")).toThrow(
    "Sina requires a valid Referer"
  );
});

test("allows Sina in Node.js runtime", () => {
  delete runtime.document;

  expect(() => assertProviderFeatureSupported("sina", "quote")).not.toThrow();
  expect(() => assertProviderFeatureSupported("sina", "search")).not.toThrow();
});
