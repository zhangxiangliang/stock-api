import type { TemplatesOptions, FinalTemplatesOptions, FinalContext, FinalOptions, CommitKnownProps, TransformedCommit } from './types/index.js';
/**
 * Load templates from options or fall back to built-in defaults.
 * @param options
 * @returns Templates strings object.
 */
export declare function loadTemplates(options?: TemplatesOptions): FinalTemplatesOptions;
/**
 * Compile Handlebars templates.
 * @param templates
 * @returns Handlebars template instance.
 */
export declare function compileTemplates(templates: FinalTemplatesOptions): HandlebarsTemplateDelegate<any>;
/**
 * Create template renderer.
 * @param context
 * @param options
 * @returns Template render function.
 */
export declare function createTemplateRenderer<Commit extends CommitKnownProps = CommitKnownProps>(context: FinalContext<Commit>, options: FinalOptions<Commit>): (commits: TransformedCommit<Commit>[], keyCommit: Commit | null, subsequent?: boolean) => Promise<string>;
//# sourceMappingURL=template.d.ts.map