'use strict';

// src/browser/index.js
var browser_default = typeof Worker < "u" ? Worker : void 0;

module.exports = browser_default;
