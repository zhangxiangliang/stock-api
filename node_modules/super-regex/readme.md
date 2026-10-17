# super-regex

> Make a regular expression time out if it takes too long to execute

This can be used to prevent [ReDoS vulnerabilities](https://en.wikipedia.org/wiki/ReDoS) when running a regular expression against untrusted user input.

This package also has a better API than the built-in regular expression methods. For example, none of the methods mutate the regex.

**Synchronous methods** (`isMatch`, `firstMatch`, `matches`) use a timeout mechanism that only works in Node.js. In the browser, they will not time out.

**Asynchronous methods** (`isMatchAsync`, `firstMatchAsync`, `matchesAsync`) run the regex in a worker thread and support timeout in both Node.js and browsers. They are especially useful for preventing ReDoS attacks in browser environments and for non-blocking execution in servers.

## Install

```sh
npm install super-regex
```

## Usage

```js
import {isMatch} from 'super-regex';

console.log(isMatch(/\d+/, getUserInput(), {timeout: 1000}));
```

```js
import {isMatchAsync} from 'super-regex';

console.log(await isMatchAsync(/\d+/, getUserInput(), {timeout: 1000}));
```

## API

### isMatch(regex, string, options?)

Returns a boolean for whether the given `regex` matches the given `string`.

If the regex takes longer to match than the given timeout, it returns `false`.

*This method is similar to [`RegExp#test`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test), but differs in that the given `regex` is [never mutated, even when it has the `/g` flag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test#using_test_on_a_regex_with_the_global_flag).*

### firstMatch(regex, string, options?)

Returns the first `Match` or `undefined` if there was no match.

If the regex takes longer to match than the given timeout, it returns `undefined`.

### matches(regex, string, options?)

Returns an iterable of `Match`es.

If the regex takes longer to match than the given timeout, it returns an empty array.

**The `regex` must have the `/g` flag.**

### isMatchAsync(regex, string, options?)

Returns a promise that resolves to a boolean for whether the given `regex` matches the given `string`.

If the regex takes longer to match than the given timeout, it returns `false`.

This method runs the regex in a worker thread, which allows it to time out in both Node.js and browsers. This is especially useful for preventing ReDoS attacks in browser environments.

*This method is similar to [`RegExp#test`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test), but differs in that the given `regex` is [never mutated, even when it has the `/g` flag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test#using_test_on_a_regex_with_the_global_flag).*

```js
import {isMatchAsync} from 'super-regex';

console.log(await isMatchAsync(/\d+/, getUserInput(), {timeout: 1000}));
```

### firstMatchAsync(regex, string, options?)

Returns a promise that resolves to the first match or `undefined` if there was no match.

If the regex takes longer to match than the given timeout, it returns `undefined`.

This method runs the regex in a worker thread, which allows it to time out in both Node.js and browsers. This is especially useful for preventing ReDoS attacks in browser environments.

```js
import {firstMatchAsync} from 'super-regex';

console.log(await firstMatchAsync(/\d+/, getUserInput(), {timeout: 1000}));
```

### matchesAsync(regex, string, options?)

Returns an async iterable of matches.

If the regex takes longer to match than the given timeout, it returns an empty iterable.

This method runs the regex in a worker thread, which allows it to time out in both Node.js and browsers. This is especially useful for preventing ReDoS attacks in browser environments.

**The `regex` must have the `/g` flag.**

```js
import {matchesAsync} from 'super-regex';

for await (const match of matchesAsync(/\d+/g, getUserInput(), {timeout: 1000})) {
	console.log(match);
}
```

#### options

Type: `object`

##### timeout?

Type: `number` *(integer)*

The time in milliseconds to wait before timing out.

##### throwOnTimeout?

Type: `boolean`\
Default: `false`

Throw a timeout error instead of returning a default value when the timeout is reached.

This lets you distinguish between “no match” and “timeout”.

By default, when a timeout occurs:
- `isMatch()` returns `false`
- `firstMatch()` returns `undefined`
- `matches()` returns an empty array
- `isMatchAsync()` returns `false`
- `firstMatchAsync()` returns `undefined`
- `matchesAsync()` returns an empty iterable

##### matchTimeout?

Type: `number` *(integer)*

Only works in `matches()`.

The time in milliseconds to wait before timing out when searching for each match.

### Match

```ts
{
	match: string;
	index: number;
	groups: string[];
	namedGroups: {string: string}; // object with string values
	input: string;
}
```

## Related

- [function-timeout](https://github.com/sindresorhus/function-timeout) - Make a synchronous function have a timeout
