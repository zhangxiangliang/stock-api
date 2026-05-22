import {
  isBrowserRuntime,
  loadBrowserJsonp,
  loadBrowserScriptValue,
} from "../../../src/utils/browser-script";

type TestScript = {
  async: boolean;
  charset: string;
  onerror: (() => void) | null;
  onload: (() => void) | null;
  parentNode?: TestParent;
  src: string;
};

type TestParent = {
  appendChild(script: TestScript): unknown;
  removeChild(script: TestScript): unknown;
};

type TestRuntime = typeof globalThis & {
  document?: unknown;
  stockApiJsonp123450?: unknown;
  v_hint?: unknown;
};

const runtime = globalThis as TestRuntime;
const originalDocument = runtime.document;

afterEach(() => {
  if (originalDocument === undefined) {
    delete runtime.document;
  } else {
    runtime.document = originalDocument;
  }

  delete runtime.v_hint;
  delete runtime.stockApiJsonp123450;
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test("detects browser runtime when a document exists", () => {
  runtime.document = { head: {} };

  expect(isBrowserRuntime()).toBe(true);
});

test("loads a script value and clears the global variable", async () => {
  const appended: TestScript[] = [];
  const removed: TestScript[] = [];
  const parent: TestParent = {
    appendChild(script) {
      script.parentNode = parent;
      appended.push(script);
      runtime.v_hint = "sz~000651~格力电器";
      script.onload?.();
    },
    removeChild(script) {
      removed.push(script);
    },
  };

  runtime.document = {
    createElement() {
      return {
        async: false,
        charset: "",
        onerror: null,
        onload: null,
        src: "",
      };
    },
    head: parent,
  };

  const value = await loadBrowserScriptValue({
    charset: "gbk",
    url: "https://example.com/search.js",
    variableName: "v_hint",
  });

  expect(value).toBe("sz~000651~格力电器");
  expect(appended).toHaveLength(1);
  expect(appended[0]).toMatchObject({
    async: true,
    charset: "gbk",
    src: "https://example.com/search.js",
  });
  expect(removed).toEqual(appended);
  expect(runtime.v_hint).toBeUndefined();
});

test("loads a JSONP response and clears the callback", async () => {
  jest.spyOn(Date, "now").mockReturnValue(12345);
  jest.spyOn(Math, "random").mockReturnValue(0);

  const parent: TestParent = {
    appendChild(script) {
      script.parentNode = parent;
      const callback = runtime.stockApiJsonp123450;

      if (typeof callback === "function") {
        callback({ ok: true });
      }

      script.onload?.();
    },
    removeChild() {},
  };

  runtime.document = {
    createElement() {
      return {
        async: false,
        charset: "",
        onerror: null,
        onload: null,
        src: "",
      };
    },
    head: parent,
  };

  const value = await loadBrowserJsonp<{ ok: boolean }>({
    callbackParam: "cb",
    url: "https://example.com/suggest?input=test",
  });

  expect(value).toEqual({ ok: true });
  expect(runtime.stockApiJsonp123450).toBeUndefined();
});
