import functionTimeout, {isTimeoutError} from 'function-timeout';
import timeSpan from 'time-span';
import makeAsynchronous, {makeAsynchronousIterable} from 'make-asynchronous';

const resultToMatch = result => ({
	match: result[0],
	index: result.index,
	groups: result.slice(1),
	namedGroups: result.groups ?? {},
	input: result.input,
});

const context = {};

const normalizeTimeout = timeout => {
	if (timeout === undefined || Number.isNaN(timeout)) {
		return undefined;
	}

	// Convert to positive integer, minimum 1
	const normalized = Math.max(1, Math.trunc(Math.abs(timeout)));

	// Handle Infinity
	if (!Number.isFinite(normalized)) {
		return undefined;
	}

	return normalized;
};

export function isMatch(regex, string, {timeout, throwOnTimeout} = {}) {
	try {
		return functionTimeout(() => structuredClone(regex).test(string), {timeout: normalizeTimeout(timeout), context})();
	} catch (error) {
		if (isTimeoutError(error) && !throwOnTimeout) {
			return false;
		}

		throw error;
	}
}

export function firstMatch(regex, string, {timeout, throwOnTimeout} = {}) {
	try {
		const result = functionTimeout(() => structuredClone(regex).exec(string), {timeout: normalizeTimeout(timeout), context})();

		if (result === null) {
			return;
		}

		return resultToMatch(result);
	} catch (error) {
		if (isTimeoutError(error) && !throwOnTimeout) {
			return;
		}

		throw error;
	}
}

export function matches(regex, string, {
	timeout = Number.POSITIVE_INFINITY,
	matchTimeout = Number.POSITIVE_INFINITY,
	throwOnTimeout,
} = {}) {
	if (!regex.global) {
		throw new Error('The regex must have the global flag, otherwise, use `firstMatch()` instead');
	}

	return {
		* [Symbol.iterator]() {
			try {
				const matches = string.matchAll(structuredClone(regex)); // The regex is only executed when iterated over.
				let remainingTimeout = timeout;

				while (true) {
					// Stop iteration if total timeout has been exceeded
					// This prevents normalizeTimeout from converting negative remainingTimeout back to positive
					if (timeout !== Number.POSITIVE_INFINITY && remainingTimeout <= 0) {
						if (throwOnTimeout) {
							const timeoutError = new Error('Script execution timed out');
							timeoutError.code = 'ERR_SCRIPT_EXECUTION_TIMEOUT';
							throw timeoutError;
						}

						return;
					}

					// `matches.next` must be called within an arrow function so that it doesn't lose its context.
					const normalizedTimeout = (timeout !== Number.POSITIVE_INFINITY || matchTimeout !== Number.POSITIVE_INFINITY)
						? normalizeTimeout(Math.min(remainingTimeout, matchTimeout))
						: undefined;

					const nextMatch = functionTimeout(() => matches.next(), {
						context,
						timeout: normalizedTimeout,
					});

					const end = timeSpan();
					const {value, done} = nextMatch();
					remainingTimeout -= Math.ceil(end());

					if (done) {
						break;
					}

					yield resultToMatch(value);
				}
			} catch (error) {
				if (isTimeoutError(error) && !throwOnTimeout) {
					return;
				}

				throw error;
			}
		},
	};
}

// Async worker functions
// These run in worker threads (via make-asynchronous) to enable true timeout support in browsers.
// Workers run in isolation and cannot access outer scope, so the Match object structure
// must be duplicated here instead of using resultToMatch(). If the Match structure changes,
// update it in: resultToMatch (line 5), firstMatchWorker (line 125), and matchesWorker (line 140).
const isMatchWorker = makeAsynchronous((source, flags, string) => {
	const regex = new RegExp(source, flags);
	return regex.test(string);
});

const firstMatchWorker = makeAsynchronous((source, flags, string) => {
	const regex = new RegExp(source, flags);
	const result = regex.exec(string);

	if (result === null) {
		return;
	}

	// Match object structure - keep in sync with resultToMatch and matchesWorker
	return {
		match: result[0],
		index: result.index,
		groups: result.slice(1),
		namedGroups: result.groups ?? {},
		input: result.input,
	};
});

const matchesWorker = makeAsynchronousIterable(function * (source, flags, string) {
	const regex = new RegExp(source, flags);
	const matches = string.matchAll(regex);

	for (const match of matches) {
		// Match object structure - keep in sync with resultToMatch and firstMatchWorker
		yield {
			match: match[0],
			index: match.index,
			groups: match.slice(1),
			namedGroups: match.groups ?? {},
			input: match.input,
		};
	}
});

const handleAsyncTimeout = (controller, timeout) => {
	if (timeout === undefined || Number.isNaN(timeout)) {
		return;
	}

	// Handle edge cases for setTimeout
	// 0, negative, or Infinity should not set a timeout
	if (timeout <= 0 || !Number.isFinite(timeout)) {
		if (timeout <= 0) {
			// Immediately abort for 0 or negative
			controller.abort();
		}

		// For Infinity or non-finite, don't set timeout (never times out)
		return () => {}; // No-op cleanup
	}

	const timeoutId = setTimeout(() => {
		controller.abort();
	}, timeout);

	return () => {
		clearTimeout(timeoutId);
	};
};

const handleAsyncError = (error, throwOnTimeout, defaultValue) => {
	if (error.name === 'AbortError') {
		if (throwOnTimeout) {
			const timeoutError = new Error('Timed out');
			timeoutError.name = 'TimeoutError';
			throw timeoutError;
		}

		return defaultValue;
	}

	throw error;
};

// Helper to reduce duplication in async methods
const withAsyncTimeout = async (workerFunction, timeout, throwOnTimeout, defaultValue) => {
	const controller = new AbortController();
	const cleanup = handleAsyncTimeout(controller, timeout);

	try {
		const result = await workerFunction(controller.signal);
		cleanup?.();
		return result;
	} catch (error) {
		cleanup?.();
		return handleAsyncError(error, throwOnTimeout, defaultValue);
	}
};

export async function isMatchAsync(regex, string, {timeout, throwOnTimeout} = {}) {
	return withAsyncTimeout(
		signal => isMatchWorker.withSignal(signal)(regex.source, regex.flags, string),
		timeout,
		throwOnTimeout,
		false,
	);
}

export async function firstMatchAsync(regex, string, {timeout, throwOnTimeout} = {}) {
	return withAsyncTimeout(
		signal => firstMatchWorker.withSignal(signal)(regex.source, regex.flags, string),
		timeout,
		throwOnTimeout,
		undefined,
	);
}

export async function * matchesAsync(regex, string, {timeout, throwOnTimeout} = {}) {
	if (!regex.global) {
		throw new Error('The regex must have the global flag, otherwise, use `firstMatchAsync()` instead');
	}

	const controller = new AbortController();
	const cleanup = handleAsyncTimeout(controller, timeout);

	try {
		for await (const match of matchesWorker.withSignal(controller.signal)(regex.source, regex.flags, string)) {
			yield match;
		}
	} catch (error) {
		return handleAsyncError(error, throwOnTimeout, undefined);
	} finally {
		cleanup?.();
	}
}
