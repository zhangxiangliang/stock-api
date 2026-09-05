import Handlebars from 'handlebars';
import { filterRevertedCommitsSync } from 'conventional-commits-filter';
import { getTemplateContext } from './context.js';
import { mainTemplate, headerPartial, commitPartial, footerPartial } from './templates.js';
/**
 * Load templates from options or fall back to built-in defaults.
 * @param options
 * @returns Templates strings object.
 */
export function loadTemplates(options = {}) {
    return {
        mainTemplate: options.mainTemplate || mainTemplate,
        headerPartial: options.headerPartial || headerPartial,
        commitPartial: options.commitPartial || commitPartial,
        footerPartial: options.footerPartial || footerPartial
    };
}
/**
 * Compile Handlebars templates.
 * @param templates
 * @returns Handlebars template instance.
 */
export function compileTemplates(templates) {
    const { mainTemplate, headerPartial, commitPartial, footerPartial, partials } = templates;
    Handlebars.registerPartial('header', headerPartial);
    Handlebars.registerPartial('commit', commitPartial);
    Handlebars.registerPartial('footer', footerPartial);
    if (partials) {
        Object.entries(partials).forEach(([name, partial]) => {
            if (typeof partial === 'string') {
                Handlebars.registerPartial(name, partial);
            }
        });
    }
    return Handlebars.compile(mainTemplate, {
        noEscape: true
    });
}
/**
 * Create template renderer.
 * @param context
 * @param options
 * @returns Template render function.
 */
export function createTemplateRenderer(context, options) {
    const { ignoreReverted } = options;
    const template = compileTemplates(options);
    return async (commits, keyCommit, subsequent) => {
        const notes = [];
        const commitsForTemplate = (ignoreReverted
            ? Array.from(filterRevertedCommitsSync(commits))
            : commits).map(commit => ({
            ...commit,
            notes: commit.notes.map((note) => {
                const commitNote = {
                    ...note,
                    commit
                };
                notes.push(commitNote);
                return commitNote;
            })
        }));
        const templateContext = await getTemplateContext(keyCommit, commits, commitsForTemplate, notes, context, options);
        const rendered = template(templateContext).trim();
        return rendered.length > 0
            ? `${subsequent ? '\n' : ''}${rendered}\n`
            : '';
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxVQUFVLE1BQU0sWUFBWSxDQUFBO0FBQ25DLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBVXZFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUNqRCxPQUFPLEVBQ0wsWUFBWSxFQUNaLGFBQWEsRUFDYixhQUFhLEVBQ2IsYUFBYSxFQUNkLE1BQU0sZ0JBQWdCLENBQUE7QUFFdkI7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxhQUFhLENBQUMsVUFBNEIsRUFBRTtJQUMxRCxPQUFPO1FBQ0wsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZLElBQUksWUFBWTtRQUNsRCxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWEsSUFBSSxhQUFhO1FBQ3JELGFBQWEsRUFBRSxPQUFPLENBQUMsYUFBYSxJQUFJLGFBQWE7UUFDckQsYUFBYSxFQUFFLE9BQU8sQ0FBQyxhQUFhLElBQUksYUFBYTtLQUN0RCxDQUFBO0FBQ0gsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsU0FBZ0M7SUFDL0QsTUFBTSxFQUNKLFlBQVksRUFDWixhQUFhLEVBQ2IsYUFBYSxFQUNiLGFBQWEsRUFDYixRQUFRLEVBQ1QsR0FBRyxTQUFTLENBQUE7SUFFYixVQUFVLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUNuRCxVQUFVLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUNuRCxVQUFVLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUVuRCxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ2IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFO1lBQ25ELElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ2hDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1lBQzNDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFO1FBQ3RDLFFBQVEsRUFBRSxJQUFJO0tBQ2YsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLHNCQUFzQixDQUNwQyxPQUE2QixFQUM3QixPQUE2QjtJQUU3QixNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFBO0lBQ2xDLE1BQU0sUUFBUSxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBRTFDLE9BQU8sS0FBSyxFQUNWLE9BQW9DLEVBQ3BDLFNBQXdCLEVBQ3hCLFVBQW9CLEVBQ3BCLEVBQUU7UUFDRixNQUFNLEtBQUssR0FBaUIsRUFBRSxDQUFBO1FBQzlCLE1BQU0sa0JBQWtCLEdBQUcsQ0FDekIsY0FBYztZQUNaLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxPQUFPLENBQ1osQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2YsR0FBRyxNQUFNO1lBQ1QsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQy9CLE1BQU0sVUFBVSxHQUFHO29CQUNqQixHQUFHLElBQUk7b0JBQ1AsTUFBTTtpQkFDUCxDQUFBO2dCQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7Z0JBRXRCLE9BQU8sVUFBVSxDQUFBO1lBQ25CLENBQUMsQ0FBQztTQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0gsTUFBTSxlQUFlLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDakgsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFBO1FBRWpELE9BQU8sUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsUUFBUSxJQUFJO1lBQzFDLENBQUMsQ0FBQyxFQUFFLENBQUE7SUFDUixDQUFDLENBQUE7QUFDSCxDQUFDIn0=