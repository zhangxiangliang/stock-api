'use strict';

var url = require('url');
var path = require('path');
var fs = require('fs');
var VM = require('vm');
var threads = require('worker_threads');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var path__default = /*#__PURE__*/_interopDefault(path);
var fs__default = /*#__PURE__*/_interopDefault(fs);
var VM__default = /*#__PURE__*/_interopDefault(VM);
var threads__default = /*#__PURE__*/_interopDefault(threads);

// node_modules/tsup/assets/cjs_shims.js
var getImportMetaUrl = () => typeof document > "u" ? new URL("file:" + __filename).href : document.currentScript && document.currentScript.src || new URL("main.js", document.baseURI).href, importMetaUrl = /* @__PURE__ */ getImportMetaUrl();
var WORKER = Symbol.for("worker"), EVENTS = Symbol.for("events"), EventTarget = class {
  constructor() {
    Object.defineProperty(this, EVENTS, {
      value: /* @__PURE__ */ new Map()
    });
  }
  dispatchEvent(event) {
    if (event.target = event.currentTarget = this, this["on" + event.type])
      try {
        this["on" + event.type](event);
      } catch (err) {
        console.error(err);
      }
    let list = this[EVENTS].get(event.type);
    list?.forEach((handler) => {
      try {
        handler.call(this, event);
      } catch (err) {
        console.error(err);
      }
    });
  }
  addEventListener(type, fn) {
    let events = this[EVENTS].get(type);
    events || this[EVENTS].set(type, events = []), events.push(fn);
  }
  removeEventListener(type, fn) {
    let events = this[EVENTS].get(type);
    if (events) {
      let index = events.indexOf(fn);
      index !== -1 && events.splice(index, 1);
    }
  }
};
function Event(type, target) {
  this.type = type, this.timeStamp = Date.now(), this.target = this.currentTarget = this.data = null;
}
var node_default = typeof Worker == "function" ? Worker : threads__default.default.isMainThread ? mainThread() : workerThread(), baseUrl = url.pathToFileURL(process.cwd() + "/");
function mainThread() {
  class Worker2 extends EventTarget {
    constructor(url$1, options) {
      super();
      let { name, type } = options || {};
      url$1 += "";
      let mod;
      /^data:/.test(url$1) ? mod = url$1 : mod = url.fileURLToPath(new url.URL(url$1, baseUrl));
      let worker = new threads__default.default.Worker(
        url.fileURLToPath(importMetaUrl),
        { workerData: { mod, name, type } }
      );
      Object.defineProperty(this, WORKER, {
        value: worker
      }), worker.on("message", (data) => {
        let event = new Event("message");
        event.data = data, this.dispatchEvent(event);
      }), worker.on("error", (error) => {
        error.type = "error", this.dispatchEvent(error);
      }), worker.on("exit", () => {
        this.dispatchEvent(new Event("close"));
      });
    }
    postMessage(data, transferList) {
      this[WORKER].postMessage(data, transferList);
    }
    terminate() {
      this[WORKER].terminate();
    }
  }
  return Worker2.prototype.onmessage = Worker2.prototype.onerror = Worker2.prototype.onclose = null, Worker2;
}
function workerThread() {
  if (typeof global.WorkerGlobalScope == "function")
    return;
  let { mod, name, type } = threads__default.default.workerData;
  if (!mod)
    return mainThread();
  let self = global.self = global, q = [];
  function flush() {
    let buffered = q;
    q = null, buffered.forEach((event) => {
      self.dispatchEvent(event);
    });
  }
  threads__default.default.parentPort.on("message", (data) => {
    let event = new Event("message");
    event.data = data, q == null ? self.dispatchEvent(event) : q.push(event);
  }), threads__default.default.parentPort.on("error", (err) => {
    err.type = "Error", self.dispatchEvent(err);
  });
  class WorkerGlobalScope extends EventTarget {
    postMessage(data, transferList) {
      threads__default.default.parentPort.postMessage(data, transferList);
    }
    // Emulates https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/close
    close() {
      process.exit();
    }
    importScripts() {
      for (let i = 0; i < arguments.length; i++) {
        let url$1 = arguments[i], code;
        /^data:/.test(url$1) ? code = parseDataUrl(url$1).data : code = fs__default.default.readFileSync(
          new url.URL(path__default.default.posix.normalize(url$1), url.pathToFileURL(mod)),
          "utf-8"
        ), VM__default.default.runInThisContext(code, { filename: url$1 });
      }
    }
  }
  let proto = Object.getPrototypeOf(global);
  delete proto.constructor, Object.defineProperties(WorkerGlobalScope.prototype, proto), proto = Object.setPrototypeOf(global, new WorkerGlobalScope()), ["postMessage", "addEventListener", "removeEventListener", "dispatchEvent"].forEach((fn) => {
    proto[fn] = proto[fn].bind(global);
  }), global.name = name, global.WorkerGlobalScope = WorkerGlobalScope;
  let isDataUrl = /^data:/.test(mod);
  if (type === "module")
    (isDataUrl ? import(mod) : import(url.pathToFileURL(mod))).catch((err) => {
      if (isDataUrl && err.message === "Not supported")
        return console.warn("Worker(): Importing data: URLs requires Node 12.10+. Falling back to classic worker."), evaluateDataUrl(mod, name);
      console.error(err);
    }).then(flush);
  else {
    try {
      /^data:/.test(mod) ? evaluateDataUrl(mod, name) : global.importScripts(mod);
    } catch (err) {
      console.error(err);
    }
    Promise.resolve().then(flush);
  }
}
function evaluateDataUrl(url, name) {
  let { data } = parseDataUrl(url);
  return VM__default.default.runInThisContext(data, {
    filename: "worker.<" + (name || "data:") + ">"
  });
}
function parseDataUrl(url) {
  let [m, type, encoding, data] = url.match(/^data: *([^;,]*)(?: *; *([^,]*))? *,(.*)$/) || [];
  if (!m)
    throw Error("Invalid Data URL.");
  if (data = decodeURIComponent(data), encoding)
    switch (encoding.toLowerCase()) {
      case "base64":
        data = Buffer.from(data, "base64").toString();
        break;
      default:
        throw Error('Unknown Data URL encoding "' + encoding + '"');
    }
  return { type, data };
}

module.exports = node_default;
