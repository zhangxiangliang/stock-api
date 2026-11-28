import {type Asyncify, type SetReturnType} from 'type-fest';

type AnyFunction = (...arguments_: any) => unknown;

type MakeAsynchronous<T> = T & {
	/**
	The function returned by `makeAsynchronous` and `makeAsynchronousIterable` has an additional method which allows an [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to be provided.

	@example
	```
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
	*/
	withSignal(signal: AbortSignal): T;
};

/**
Make a synchronous function asynchronous by running it in a worker.

Returns a wrapped version of the given function which executes asynchronously in a background thread (meaning it will not block the main thread).

The given function is serialized, so you cannot use any variables or imports from outside the function scope. You can instead pass in arguments to the function.

@example
```
import makeAsynchronous from 'make-asynchronous';

const fn = makeAsynchronous(number => {
	return performExpensiveOperation(number);
});

console.log(await fn(2));
//=> 345342
```
*/
export default function makeAsynchronous<T extends AnyFunction>(function_: T): MakeAsynchronous<Asyncify<T>>;

type IterableFunctionValue<T> = T extends ((...arguments_: any) => AsyncIterable<infer Value> | Iterable<infer Value>) ? Value : unknown;

/**
Make the iterable returned by a function asynchronous by running it in a worker.

Returns a wrapped version of the given function which executes asynchronously in a background thread (meaning it will not block the main thread).

The given function is serialized, so you cannot use any variables or imports from outside the function scope. You can instead pass in arguments to the function.

@example
```
import {makeAsynchronousIterable} from 'make-asynchronous';

const fn = makeAsynchronousIterable(function * (number) {
	yield * performExpensiveOperation(number);
});

for await (const number of fn(2)) {
	console.log(number);
}
```
*/
export function makeAsynchronousIterable<T extends (...arguments_: any) => AsyncIterable<unknown> | Iterable<unknown>>(function_: T): MakeAsynchronous<SetReturnType<T, AsyncIterable<IterableFunctionValue<T>>>>;
