import { Transform } from 'stream';
import { loadTemplates, createTemplateRenderer } from './template.js';
import { getFinalContext } from './context.js';
import { getFinalOptions, getGenerateOnFunction } from './options.js';
import { transformCommit } from './commit.js';
function getRequirements(context = {}, options = {}) {
    const templates = loadTemplates(options);
    const finalOptions = getFinalOptions(options, templates);
    const finalContext = getFinalContext(context, finalOptions);
    const generateOn = getGenerateOnFunction(finalContext, finalOptions);
    const renderTemplate = createTemplateRenderer(finalContext, finalOptions);
    return {
        finalContext,
        finalOptions,
        generateOn,
        renderTemplate
    };
}
export function writeChangelog(context = {}, options = {}, includeDetails = false) {
    const requirementsPromise = getRequirements(context, options);
    const prepResult = includeDetails
        ? (log, keyCommit) => ({
            log,
            keyCommit
        })
        : (log) => log;
    return async function* write(commits) {
        const { finalContext, finalOptions, generateOn, renderTemplate } = await requirementsPromise;
        const { transform, reverse, doFlush, skip } = finalOptions;
        let chunk;
        let commit;
        let keyCommit;
        let commitsGroup = [];
        let neverGenerated = true;
        let result = '';
        let savedKeyCommit = null;
        let firstRelease = true;
        for await (chunk of commits) {
            commit = await transformCommit(chunk, transform, finalContext, finalOptions);
            keyCommit = commit || chunk;
            if (skip?.(keyCommit)) {
                continue;
            }
            // previous blocks of logs
            if (reverse) {
                if (commit) {
                    commitsGroup.push(commit);
                }
                if (generateOn(keyCommit, commitsGroup)) {
                    neverGenerated = false;
                    result = await renderTemplate(commitsGroup, keyCommit, result.length > 0);
                    commitsGroup = [];
                    yield prepResult(result, keyCommit);
                }
            }
            else {
                if (generateOn(keyCommit, commitsGroup)) {
                    neverGenerated = false;
                    result = await renderTemplate(commitsGroup, savedKeyCommit, result.length > 0);
                    commitsGroup = [];
                    if (!firstRelease || doFlush) {
                        yield prepResult(result, savedKeyCommit);
                    }
                    firstRelease = false;
                    savedKeyCommit = keyCommit;
                }
                if (commit) {
                    commitsGroup.push(commit);
                }
            }
        }
        if (!doFlush && (reverse || neverGenerated)) {
            return;
        }
        result = await renderTemplate(commitsGroup, savedKeyCommit, result.length > 0);
        yield prepResult(result, savedKeyCommit);
    };
}
/**
 * Creates a transform stream which takes commits and outputs changelog entries.
 * @param context - Context for changelog template.
 * @param options - Options for changelog template.
 * @param includeDetails - Whether to emit details object instead of changelog entry.
 * @returns Transform stream which takes commits and outputs changelog entries.
 */
export function writeChangelogStream(context, options, includeDetails = false) {
    return Transform.from(writeChangelog(context, options, includeDetails));
}
/**
 * Create a changelog string from commits.
 * @param commits - Commits to generate changelog from.
 * @param context - Context for changelog template.
 * @param options - Options for changelog template.
 * @returns Changelog string.
 */
export async function writeChangelogString(commits, context, options) {
    const changelogAsyncIterable = writeChangelog(context, options)(commits);
    let changelog = '';
    let chunk;
    for await (chunk of changelogAsyncIterable) {
        changelog += chunk;
    }
    return changelog;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy93cml0ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFRbEMsT0FBTyxFQUNMLGFBQWEsRUFDYixzQkFBc0IsRUFDdkIsTUFBTSxlQUFlLENBQUE7QUFDdEIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUM5QyxPQUFPLEVBQ0wsZUFBZSxFQUNmLHFCQUFxQixFQUN0QixNQUFNLGNBQWMsQ0FBQTtBQUNyQixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBRTdDLFNBQVMsZUFBZSxDQUd0QixVQUEyQixFQUFFLEVBQzdCLFVBQTJCLEVBQUU7SUFFN0IsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3hDLE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDeEQsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQTtJQUMzRCxNQUFNLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUE7SUFDcEUsTUFBTSxjQUFjLEdBQUcsc0JBQXNCLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFBO0lBRXpFLE9BQU87UUFDTCxZQUFZO1FBQ1osWUFBWTtRQUNaLFVBQVU7UUFDVixjQUFjO0tBQ2YsQ0FBQTtBQUNILENBQUM7QUF5QkQsTUFBTSxVQUFVLGNBQWMsQ0FDNUIsVUFBMkIsRUFBRSxFQUM3QixVQUEyQixFQUFFLEVBQzdCLGNBQWMsR0FBRyxLQUFLO0lBRXRCLE1BQU0sbUJBQW1CLEdBQUcsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUM3RCxNQUFNLFVBQVUsR0FBRyxjQUFjO1FBQy9CLENBQUMs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