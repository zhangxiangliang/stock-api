# make-asynchronous

> Make a synchronous function asynchronous by running it in a [worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

This makes it super simple to offload some expensive work without having to deal with the complex Web Workers API.

**Please upvote [this Node.js issue](https://github.com/nodejs/node/issues/43583) 🙏** It would let us reduce the amount of dependencies and simplify the code.

*Works in Node.js and browsers.*

## Install

```sh
npm install make-asynchronous
```

## Usage

```js
import makeAsynchronous from 'make-asynchronous';

const fn = makeAsynchronous(number => {
	return performExpensiveOperation(number);
});

console.log(await fn(2));
//=> 345342
```

## API

### makeAsynchronous(function)

Returns a wrapped version of the given function which executes asynchronously in a background thread (meaning it will not block the main thread).

The given function is serialized, so you cannot use any variables or imports from outside the function scope. You can instead pass in arguments to the function.

### makeAsynchronousIterable(function)

Make the iterable returned by a function asynchronous by running it in a worker.

```js
import {makeAsynchronousIterable} from 'make-asynchronous';

const fn = makeAsynchronousIterable(function * (number) {
	yield * performExpensiveOperation(number);
});

for await (const number of fn(2)) {
	console.log(number);
}
```

#### fn.withSignal(signal)

The function returned by `makeAsynchronous` and `makeAsynchronousIterable` has an additional method which allows an [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to be provided.

```js
import makeAsynchronous from 'make-asynchronous';

const fn = makeAsynchronous(number => {
	return performExpensiveOperation(number);
});

const controller = new AbortController();
const timeoutId = setTimeout(() => {
	controller.abort();
}, 1000); // 1 second timeout

const result = await fn.withSignal(controller.signal)(2);
clearTimeout(timeoutId);

console.log(result);
//=> 345342
```

## Related

- [make-synchronous](https://github.com/sindresorhus/make-synchronous) - Make an asynchronous function synchronous
- [sleep-synchronously](https://github.com/sindresorhus/sleep-synchronously) - Block the main thread for a given amount of time
