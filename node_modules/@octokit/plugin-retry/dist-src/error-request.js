import {} from "./types.js";
function isRequestError(error) {
  return error.request !== void 0;
}
async function errorRequest(state, octokit, error, options) {
  if (!isRequestError(error) || !error?.request.request) {
    throw error;
  }
  if (error.status >= 400 && !state.doNotRetry.includes(error.status)) {
    const retries = options.request.retries != null ? options.request.retries : state.retries;
    const retryAfter = Math.pow((options.request.retryCount || 0) + 1, 2);
    throw octokit.retry.retryRequest(error, retries, retryAfter);
  }
  throw error;
}
export {
  errorRequest,
  isRequestError
};
