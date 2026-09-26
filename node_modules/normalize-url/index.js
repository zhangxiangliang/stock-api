// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
const DATA_URL_DEFAULT_MIME_TYPE = 'text/plain';
const DATA_URL_DEFAULT_CHARSET = 'us-ascii';

const encodedReservedCharactersPattern = '%(?:3A|2F|3F|23|5B|5D|40|21|24|26|27|28|29|2A|2B|2C|3B|3D)';
const temporaryEncodedReservedTokenBase = '__normalize_url_encoded_reserved__';
const temporaryEncodedReservedTokenPattern = /__normalize_url_encoded_reserved__(\d+)__/g;
const hasEncodedReservedCharactersRegex = new RegExp(encodedReservedCharactersPattern, 'i');
const encodedReservedCharactersRegex = new RegExp(encodedReservedCharactersPattern, 'gi');

const testParameter = (name, filters) => Array.isArray(filters) && filters.some(filter => {
	if (filter instanceof RegExp) {
		if (filter.flags.includes('g') || filter.flags.includes('y')) {
			return new RegExp(filter.source, filter.flags.replaceAll(/[gy]/g, '')).test(name);
		}

		return filter.test(name);
	}

	return filter === name;
});

const supportedProtocols = new Set([
	'https:',
	'http:',
	'file:',
]);

const normalizeCustomProtocolOption = protocol => {
	if (typeof protocol !== 'string') {
		return undefined;
	}

	const normalizedProtocol = protocol.trim().toLowerCase().replace(/:$/, '');
	return normalizedProtocol === '' ? undefined : `${normalizedProtocol}:`;
};

const getCustomProtocol = urlString => {
	try {
		const {protocol} = new URL(urlString);
		const hasAuthority = urlString.slice(0, protocol.length + 2).toLowerCase() === `${protocol}//`;

		if (protocol.endsWith(':')
			&& (!protocol.includes('.') || hasAuthority)
			&& !supportedProtocols.has(protocol)) {
			return protocol;
		}
	} catch {}

	return undefined;
};

const decodeQueryKey = value => {
	try {
		return decodeURIComponent(value.replaceAll('+', '%20'));
	} catch {
		// Match URLSearchParams behavior for malformed percent-encoding.
		return new URLSearchParams(`${value}=`).keys().next().value;
	}
};

const getKeysWithoutEquals = search => {
	const keys = new Set();
	if (!search) {
		return keys;
	}

	for (const part of search.slice(1).split('&')) {
		if (part && !part.includes('=')) {
			keys.add(decodeQueryKey(part));
		}
	}

	return keys;
};

const getTemporaryEncodedReservedTokenPrefix = search => {
	let decodedSearch = search;

	try {
		decodedSearch = decodeURIComponent(search);
	} catch {
		decodedSearch = new URLSearchParams(search).toString();
	}

	const getUsedTokenIndexes = value => {
		const indexes = new Set();

		for (const match of value.matchAll(temporaryEncodedReservedTokenPattern)) {
			indexes.add(Number.parseInt(match[1], 10));
		}

		return indexes;
	};

	const usedTokenIndexes = getUsedTokenIndexes(search);
	for (const tokenIndex of getUsedTokenIndexes(decodedSearch)) {
		usedTokenIndexes.add(tokenIndex);
	}

	let tokenIndex = 0;
	while (usedTokenIndexes.has(tokenIndex)) {
		tokenIndex++;
	}

	return `${temporaryEncodedReservedTokenBase}${tokenIndex}__`;
};

const sortSearchParameters = (searchParameters, encodedReservedTokenRegex) => {
	if (!encodedReservedTokenRegex) {
		searchParameters.sort();
		return searchParameters.toString();
	}

	const getSortableKey = key => key.replace(encodedReservedTokenRegex, (_, hexCode) => String.fromCodePoint(Number.parseInt(hexCode, 16)));
	const entries = [...searchParameters.entries()];
	entries.sort(([leftKey], [rightKey]) => {
		const left = getSortableKey(leftKey);
		const right = getSortableKey(rightKey);
		return left < right ? -1 : (left > right ? 1 : 0);
	});

	return new URLSearchParams(entries).toString();
};

const decodeReservedTokens = (value, encodedReservedTokenRegex) => {
	if (!encodedReservedTokenRegex) {
		return value;
	}

	return value.replace(encodedReservedTokenRegex, (_, hexCode) => String.fromCodePoint(Number.parseInt(hexCode, 16)));
};

const normalizeEmptyQueryParameters = (search, emptyQueryValue, originalSearch) => {
	const isAlways = emptyQueryValue === 'always';
	const isNever = emptyQueryValue === 'never';
	const keysWithoutEquals = (isAlways || isNever) ? undefined : getKeysWithoutEquals(originalSearch);

	const normalizeKey = key => key.replaceAll('+', '%20');
	const formatEmptyValue = normalizedKey => {
		if (isAlways) {
			return `${normalizedKey}=`;
		}

		if (isNever) {
			return normalizedKey;
		}

		return keysWithoutEquals.has(decodeQueryKey(normalizedKey)) ? normalizedKey : `${normalizedKey}=`;
	};

	const normalizeParameter = parameter => {
		const equalIndex = parameter.indexOf('=');

		if (equalIndex === -1) {
			// Normalize + to %20 (+ means space in query strings)
			return formatEmptyValue(normalizeKey(parameter));
		}

		const key = parameter.slice(0, equalIndex);
		const value = parameter.slice(equalIndex + 1);

		if (value === '') {
			if (key === '') {
				return '=';
			}

			// Normalize + to %20 (+ means space in query strings)
			return formatEmptyValue(normalizeKey(key));
		}

		// Normalize + to %20 in key.
		return `${normalizeKey(key)}=${value}`;
	};

	const parameters = search.slice(1).split('&').filter(Boolean);
	return parameters.length === 0 ? '' : `?${parameters.map(x => normalizeParameter(x)).join('&')}`;
};

const normalizeDataURL = (urlString, {stripHash}) => {
	const match = /^data:(?<type>[^,]*?),(?<data>[^#]*?)(?:#(?<hash>.*))?$/.exec(urlString);

	if (!match) {
		throw new Error(`Invalid URL: ${urlString}`);
	}

	const {type, data, hash} = match.groups;
	const mediaType = type.split(';');

	const isBase64 = mediaType.at(-1) === 'base64';
	if (isBase64) {
		mediaType.pop();
	}

	// Lowercase MIME type
	const mimeType = mediaType.shift().toLowerCase();
	const attributes = mediaType
		.map(attribute => {
			let [key, value = ''] = attribute.split('=').map(string => string.trim());

			// Lowercase `charset`
			if (key === 'charset') {
				value = value.toLowerCase();

				if (value === DATA_URL_DEFAULT_CHARSET) {
					return '';
				}
			}

			return `${key}${value ? `=${value}` : ''}`;
		})
		.filter(Boolean);

	const normalizedMediaType = [...attributes];

	if (isBase64) {
		normalizedMediaType.push('base64');
	}

	if (normalizedMediaType.length > 0 || (mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE)) {
		normalizedMediaType.unshift(mimeType);
	}

	const hashPart = stripHash || !hash ? '' : `#${hash}`;
	return `data:${normalizedMediaType.join(';')},${isBase64 ? data.trim() : data}${hashPart}`;
};

export default function normalizeUrl(urlString, options) {
	options = {
		defaultProtocol: 'http',
		normalizeProtocol: true,
		forceHttp: false,
		forceHttps: false,
		stripAuthentication: true,
		stripHash: false,
		stripTextFragment: true,
		stripWWW: true,
		removeQueryParameters: [/^utm_\w+/i],
		removeTrailingSlash: true,
		removeSingleSlash: true,
		removeDirectoryIndex: false,
		removeExplicitPort: false,
		sortQueryParameters: true,
		removePath: false,
		transformPath: false,
		emptyQueryValue: 'preserve',
		...options,
	};

	// Legacy: Append `:` to the protocol if missing.
	if (typeof options.defaultProtocol === 'string' && !options.defaultProtocol.endsWith(':')) {
		options.defaultProtocol = `${options.defaultProtocol}:`;
	}

	urlString = urlString.trim();

	// Data URL
	if (/^data:/i.test(urlString)) {
		return normalizeDataURL(urlString, options);
	}

	const customProtocols = Array.isArray(options.customProtocols) ? options.customProtocols : [];
	const normalizedCustomProtocols = new Set(customProtocols
		.map(protocol => normalizeCustomProtocolOption(protocol))
		.filter(Boolean));

	const customProtocol = getCustomProtocol(urlString);
	if (customProtocol && !normalizedCustomProtocols.has(customProtocol)) {
		return urlString;
	}

	const hasRelativeProtocol = urlString.startsWith('//');
	const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);

	// Prepend protocol
	if (!isRelativeUrl && !customProtocol) {
		urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
	}

	const urlObject = new URL(urlString);

	if (options.forceHttp && options.forceHttps) {
		throw new Error('The `forceHttp` and `forceHttps` options cannot be used together');
	}

	if (options.forceHttp && urlObject.protocol === 'https:') {
		urlObject.protocol = 'http:';
	}

	if (options.forceHttps && urlObject.protocol === 'http:') {
		urlObject.protocol = 'https:';
	}

	// Remove auth
	if (options.stripAuthentication) {
		urlObject.username = '';
		urlObject.password = '';
	}

	// Remove hash
	if (options.stripHash) {
		urlObject.hash = '';
	} else if (options.stripTextFragment) {
		urlObject.hash = urlObject.hash.replace(/#?:~:text.*?$/i, '');
	}

	// Remove duplicate slashes if not preceded by a protocol
	// NOTE: This could be implemented using a single negative lookbehind
	// regex, but we avoid that to maintain compatibility with older js engines
	// which do not have support for that feature.
	if (urlObject.pathname) {
		// TODO: Replace everything below with `urlObject.pathname = urlObject.pathname.replace(/(?<!\b[a-z][a-z\d+\-.]{1,50}:)\/{2,}/g, '/');` when Safari supports negative lookbehind.

		// Split the string by occurrences of this protocol regex, and perform
		// duplicate-slash replacement on the strings between those occurrences
		// (if any).
		const protocolRegex = /\b[a-z][a-z\d+\-.]{1,50}:\/\//g;

		let lastIndex = 0;
		let result = '';
		for (;;) {
			const match = protocolRegex.exec(urlObject.pathname);
			if (!match) {
				break;
			}

			const protocol = match[0];
			const protocolAtIndex = match.index;
			const intermediate = urlObject.pathname.slice(lastIndex, protocolAtIndex);

			result += intermediate.replaceAll(/\/{2,}/g, '/');
			result += protocol;
			lastIndex = protocolAtIndex + protocol.length;
		}

		const remnant = urlObject.pathname.slice(lastIndex);
		result += remnant.replaceAll(/\/{2,}/g, '/');

		urlObject.pathname = result;
	}

	// Decode URI octets
	if (urlObject.pathname) {
		try {
			urlObject.pathname = decodeURI(urlObject.pathname).replaceAll('\\', '%5C');
		} catch {}
	}

	// Remove directory index
	if (options.removeDirectoryIndex === true) {
		options.removeDirectoryIndex = [/^index\.[a-z]+$/];
	}

	if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
		const pathComponents = urlObject.pathname.split('/').filter(Boolean);
		const lastComponent = pathComponents.at(-1);

		if (lastComponent && testParameter(lastComponent, options.removeDirectoryIndex)) {
			pathComponents.pop();
			urlObject.pathname = pathComponents.length > 0 ? `/${pathComponents.join('/')}/` : '/';
		}
	}

	// Remove path
	if (options.removePath) {
		urlObject.pathname = '/';
	}

	// Transform path components
	if (options.transformPath && typeof options.transformPath === 'function') {
		const pathComponents = urlObject.pathname.split('/').filter(Boolean);
		const newComponents = options.transformPath(pathComponents);
		urlObject.pathname = newComponents?.length > 0 ? `/${newComponents.join('/')}` : '/';
	}

	if (urlObject.hostname) {
		// Remove trailing dot
		urlObject.hostname = urlObject.hostname.replace(/\.$/, '');

		// Remove `www.`
		if (options.stripWWW && /^www\.(?!www\.)[a-z\-\d]{1,63}\.[a-z.\-\d]{2,63}$/.test(urlObject.hostname)) {
			// Each label should be max 63 at length (min: 1).
			// Source: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
			// Each TLD should be up to 63 characters long (min: 2).
			// It is technically possible to have a single character TLD, but none currently exist.
			urlObject.hostname = urlObject.hostname.replace(/^www\./, '');
		}
	}

	// Capture original query params format before any searchParams modifications
	const originalSearch = urlObject.search;
	let encodedReservedTokenRegex;

	if (options.sortQueryParameters && hasEncodedReservedCharactersRegex.test(originalSearch)) {
		const encodedReservedTokenPrefix = getTemporaryEncodedReservedTokenPrefix(originalSearch);
		urlObject.search = originalSearch.replaceAll(encodedReservedCharactersRegex, match => `${encodedReservedTokenPrefix}${match.slice(1).toUpperCase()}`);
		encodedReservedTokenRegex = new RegExp(`${encodedReservedTokenPrefix}([0-9A-F]{2})`, 'g');
	}

	const hasKeepQueryParameters = Array.isArray(options.keepQueryParameters);
	const {searchParams} = urlObject;

	// Remove query unwanted parameters
	if (!hasKeepQueryParameters && Array.isArray(options.removeQueryParameters) && options.removeQueryParameters.length > 0) {
		// eslint-disable-next-line unicorn/no-useless-spread -- We are intentionally spreading to get a copy.
		for (const key of [...searchParams.keys()]) {
			if (testParameter(decodeReservedTokens(key, encodedReservedTokenRegex), options.removeQueryParameters)) {
				searchParams.delete(key);
			}
		}
	}

	if (!hasKeepQueryParameters && options.removeQueryParameters === true) {
		urlObject.search = '';
	}

	// Keep wanted query parameters
	if (hasKeepQueryParameters && options.keepQueryParameters.length > 0) {
		// eslint-disable-next-line unicorn/no-useless-spread -- We are intentionally spreading to get a copy.
		for (const key of [...searchParams.keys()]) {
			if (!testParameter(decodeReservedTokens(key, encodedReservedTokenRegex), options.keepQueryParameters)) {
				searchParams.delete(key);
			}
		}
	} else if (hasKeepQueryParameters) {
		urlObject.search = '';
	}

	// Sort query parameters
	if (options.sortQueryParameters) {
		urlObject.search = sortSearchParameters(urlObject.searchParams, encodedReservedTokenRegex);

		// Sorting and serializing encode the search parameters, so we need to decode them again.
		// Protect &%#? and %2B from decoding (would break URL structure or change meaning) by double-encoding them first.
		urlObject.search = decodeURIComponent(urlObject.search.replaceAll(/%(?:26|23|3f|25|2b)/gi, match => `%25${match.slice(1)}`));

		if (encodedReservedTokenRegex) {
			urlObject.search = urlObject.search.replace(encodedReservedTokenRegex, '%$1');
		}
	}

	// Normalize empty query parameter values
	urlObject.search = normalizeEmptyQueryParameters(urlObject.search, options.emptyQueryValue, originalSearch);

	if (options.removeTrailingSlash) {
		urlObject.pathname = urlObject.pathname.replace(/\/$/, '');
	}

	// Remove an explicit port number, excluding a default port number, if applicable
	if (options.removeExplicitPort && urlObject.port) {
		urlObject.port = '';
	}

	const oldUrlString = urlString;

	// Take advantage of many of the Node `url` normalizations
	urlString = urlObject.toString();

	if (!options.removeSingleSlash && urlObject.pathname === '/' && !oldUrlString.endsWith('/') && urlObject.hash === '') {
		urlString = urlString.replace(/\/$/, '');
	}

	// Remove ending `/` unless removeSingleSlash is false
	if ((options.removeTrailingSlash || urlObject.pathname === '/') && urlObject.hash === '' && options.removeSingleSlash) {
		urlString = urlString.replace(/\/$/, '');
	}

	// Restore relative protocol, if applicable
	if (hasRelativeProtocol && !options.normalizeProtocol) {
		urlString = urlString.replace(/^http:\/\//, '//');
	}

	// Remove http/https
	if (options.stripProtocol) {
		urlString = urlString.replace(/^(?:https?:)?\/\//, '');
	}

	return urlString;
}
