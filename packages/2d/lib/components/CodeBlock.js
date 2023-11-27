var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { computed, initial, parser, signal } from '../decorators';
import { useLogger } from '@motion-canvas/core/lib/utils';
import { Shape } from './Shape';
import { parse, diff, ready, } from 'code-fns';
import { clampRemap, easeInOutSine, map, tween, } from '@motion-canvas/core/lib/tweening';
import { threadable } from '@motion-canvas/core/lib/decorators';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createComputedAsync, createSignal, } from '@motion-canvas/core/lib/signals';
import { join } from '@motion-canvas/core/lib/threading';
import { waitFor } from '@motion-canvas/core/lib/flow';
export class CodeBlock extends Shape {
    *tweenSelection(value, duration, timingFunction) {
        this.oldSelection = this.selection();
        this.selection(value);
        this.selectionProgress(0);
        yield* this.selectionProgress(1, duration, timingFunction);
        this.selectionProgress(null);
        this.oldSelection = null;
    }
    getLineCountOfTokenArray(tokens) {
        let count = 0;
        for (const token of tokens) {
            for (let i = 0; i < token.code.length; i++) {
                if (token.code[i] === '\n') {
                    count++;
                }
            }
        }
        if (tokens.length > 0) {
            count++;
        }
        return count;
    }
    lineCount() {
        const progress = this.codeProgress();
        if (progress !== null) {
            return Math.round(map(this.currentLineCount, this.newLineCount, progress));
        }
        return this.getLineCountOfTokenArray(this.parsed());
    }
    parsed() {
        if (!CodeBlock.initialized()) {
            return [];
        }
        return parse(this.code(), { codeStyle: this.theme() });
    }
    constructor({ children, ...rest }) {
        super({
            fontFamily: 'monospace',
            ...rest,
        });
        this.codeProgress = createSignal(null);
        this.selectionProgress = createSignal(null);
        this.oldSelection = null;
        this.diffed = null;
        this.currentLineCount = 0;
        this.newLineCount = 0;
        if (children) {
            this.code(children);
        }
    }
    characterSize() {
        this.requestFontUpdate();
        const context = this.cacheCanvas();
        context.save();
        this.applyStyle(context);
        context.font = this.styles.font;
        const width = context.measureText('X').width;
        context.restore();
        return new Vector2(width, parseFloat(this.styles.lineHeight));
    }
    desiredSize() {
        const custom = super.desiredSize();
        const tokensSize = this.getTokensSize(this.parsed());
        return {
            x: custom.x ?? tokensSize.x,
            y: custom.y ?? tokensSize.y,
        };
    }
    getTokensSize(tokens) {
        const size = this.characterSize();
        let maxWidth = 0;
        let height = size.height;
        let width = 0;
        for (const token of tokens) {
            for (let i = 0; i < token.code.length; i++) {
                if (token.code[i] === '\n') {
                    if (width > maxWidth) {
                        maxWidth = width;
                    }
                    width = 0;
                    height += size.height;
                }
                else {
                    width += size.width;
                }
            }
        }
        if (width > maxWidth) {
            maxWidth = width;
        }
        return { x: maxWidth, y: height };
    }
    collectAsyncResources() {
        super.collectAsyncResources();
        CodeBlock.initialized();
    }
    set(strings, ...rest) {
        this.code({
            language: this.language(),
            spans: strings,
            nodes: rest,
        });
    }
    /**
     * Smoothly edit the code.
     *
     * @remarks
     * This method returns a tag function that should be used together with a
     * template literal to define what to edit. Expressions can be used to either
     * {@link insert}, {@link remove}, or {@link edit} the code.
     *
     * @example
     * ```ts
     * yield* codeBlock().edit()`
     *   const ${edit('a', 'b')} = [${insert('1, 2, 3')}];${remove(`
     *   // this comment will be removed`)}
     * `;
     * ```
     *
     * @param duration - The duration of the transition.
     * @param changeSelection - When set to `true`, the selection will be modified
     *                          to highlight the newly inserted code. Setting it
     *                          to `false` leaves the selection untouched.
     *                          Providing a custom {@link CodeRange} will select
     *                          it instead.
     */
    edit(duration = 0.6, changeSelection = true) {
        function* generator(strings, ...rest) {
            const from = {
                language: this.language(),
                spans: [...strings],
                nodes: rest.map(modification => isCodeModification(modification) ? modification.from : modification),
            };
            const to = {
                language: this.language(),
                spans: [...strings],
                nodes: rest.map(modification => isCodeModification(modification) ? modification.to : modification),
            };
            this.code(from);
            if (changeSelection) {
                const task = yield this.code(to, duration);
                yield* waitFor(duration * 0.2);
                yield* this.selection([], duration * 0.3);
                const newSelection = changeSelection === true
                    ? diff(from, to)
                        .filter(token => token.morph === 'create')
                        .map(token => [
                        [token.to[1], token.to[0]],
                        [token.to[1], token.to[0] + token.code.length],
                    ])
                    : changeSelection;
                yield* this.selection(newSelection, duration * 0.3);
                yield* join(task);
            }
            else {
                yield* this.code(to, duration);
            }
        }
        return generator.bind(this);
    }
    *tweenCode(code, time, timingFunction) {
        if (typeof code === 'function')
            throw new Error();
        if (!CodeBlock.initialized())
            return;
        const currentParsedCode = parse(this.code(), { codeStyle: this.theme() });
        const newParsedCode = parse(code, { codeStyle: this.theme() });
        this.currentLineCount = this.getLineCountOfTokenArray(currentParsedCode);
        this.newLineCount = this.getLineCountOfTokenArray(newParsedCode);
        const autoWidth = this.width.isInitial();
        const autoHeight = this.height.isInitial();
        const fromSize = this.size();
        const toSize = this.getTokensSize(newParsedCode);
        const beginning = 0.2;
        const ending = 0.8;
        this.codeProgress(0);
        this.diffed = diff(this.code(), code, { codeStyle: this.theme() });
        yield* tween(time, value => {
            const progress = timingFunction(value);
            const remapped = clampRemap(beginning, ending, 0, 1, progress);
            this.codeProgress(progress);
            if (autoWidth) {
                this.width(easeInOutSine(remapped, fromSize.x, toSize.x));
            }
            if (autoHeight) {
                this.height(easeInOutSine(remapped, fromSize.y, toSize.y));
            }
        }, () => {
            this.codeProgress(null);
            this.diffed = null;
            if (autoWidth) {
                this.width.reset();
            }
            if (autoHeight) {
                this.height.reset();
            }
            this.code(code);
        });
    }
    draw(context) {
        if (!CodeBlock.initialized())
            return;
        this.requestFontUpdate();
        this.applyStyle(context);
        context.font = this.styles.font;
        context.textBaseline = 'top';
        const lh = parseFloat(this.styles.lineHeight);
        const w = context.measureText('X').width;
        const size = this.computedSize();
        const progress = this.codeProgress();
        const unselectedOpacity = this.unselectedOpacity();
        const globalAlpha = context.globalAlpha;
        const getSelectionAlpha = (x, y) => map(unselectedOpacity, 1, this.selectionStrength(x, y));
        const drawToken = (code, position, alpha = 1) => {
            for (let i = 0; i < code.length; i++) {
                const char = code.charAt(i);
                if (char === '\n') {
                    position.y++;
                    position.x = 0;
                    continue;
                }
                context.globalAlpha =
                    globalAlpha * alpha * getSelectionAlpha(position.x, position.y);
                context.fillText(char, position.x * w, position.y * lh);
                position.x++;
            }
        };
        context.translate(size.x / -2, size.y / -2);
        if (progress == null) {
            const parsed = this.parsed();
            const position = { x: 0, y: 0 };
            for (const token of parsed) {
                context.save();
                context.fillStyle = token.color ?? '#c9d1d9';
                drawToken(token.code, position);
                context.restore();
            }
        }
        else {
            const diffed = this.diffed;
            const beginning = 0.2;
            const ending = 0.8;
            const overlap = 0.15;
            for (const token of diffed) {
                context.save();
                context.fillStyle = token.color ?? '#c9d1d9';
                if (token.morph === 'delete') {
                    drawToken(token.code, { x: token.from[0], y: token.from[1] }, clampRemap(0, beginning + overlap, 1, 0, progress));
                }
                else if (token.morph === 'create') {
                    drawToken(token.code, { x: token.to[0], y: token.to[1] }, clampRemap(ending - overlap, 1, 0, 1, progress));
                }
                else if (token.morph === 'retain') {
                    const remapped = clampRemap(beginning, ending, 0, 1, progress);
                    const x = easeInOutSine(remapped, token.from[0], token.to[0]);
                    const y = easeInOutSine(remapped, token.from[1], token.to[1]);
                    const point = remapped > 0.5 ? token.to : token.from;
                    let offsetX = 0;
                    let offsetY = 0;
                    for (let i = 0; i < token.code.length; i++) {
                        const char = token.code.charAt(i);
                        if (char === '\n') {
                            offsetY++;
                            offsetX = 0;
                            continue;
                        }
                        context.globalAlpha =
                            globalAlpha *
                                getSelectionAlpha(point[0] + offsetX, point[1] + offsetY);
                        context.fillText(char, (x + offsetX) * w, (y + offsetY) * lh);
                        offsetX++;
                    }
                }
                else {
                    useLogger().warn({
                        message: 'Invalid token',
                        object: token,
                    });
                }
                context.restore();
            }
        }
    }
    selectionStrength(x, y) {
        const selection = this.selection();
        const selectionProgress = this.selectionProgress();
        const isSelected = CodeBlock.selectionStrength(selection, x, y);
        if (selectionProgress === null || this.oldSelection === null) {
            return isSelected ? 1 : 0;
        }
        const wasSelected = CodeBlock.selectionStrength(this.oldSelection, x, y);
        if (isSelected === wasSelected) {
            return isSelected;
        }
        return map(wasSelected, isSelected, selectionProgress);
    }
    static selectionStrength(selection, x, y) {
        return selection.length > 0 &&
            !!selection.find(([[startLine, startColumn], [endLine, endColumn]]) => {
                return (((y === startLine && x >= startColumn) || y > startLine) &&
                    ((y === endLine && x < endColumn) || y < endLine));
            })
            ? 1
            : 0;
    }
}
CodeBlock.initialized = createComputedAsync(() => ready().then(() => true), false);
__decorate([
    initial('tsx'),
    signal()
], CodeBlock.prototype, "language", void 0);
__decorate([
    initial(''),
    parser(function (value) {
        return typeof value === 'string'
            ? {
                language: this.language(),
                spans: [value],
                nodes: [],
            }
            : value;
    }),
    signal()
], CodeBlock.prototype, "code", void 0);
__decorate([
    initial(undefined),
    signal()
], CodeBlock.prototype, "theme", void 0);
__decorate([
    initial(lines(0, Infinity)),
    signal()
], CodeBlock.prototype, "selection", void 0);
__decorate([
    initial(0.32),
    signal()
], CodeBlock.prototype, "unselectedOpacity", void 0);
__decorate([
    computed()
], CodeBlock.prototype, "lineCount", null);
__decorate([
    computed()
], CodeBlock.prototype, "parsed", null);
__decorate([
    computed()
], CodeBlock.prototype, "characterSize", null);
__decorate([
    threadable()
], CodeBlock.prototype, "tweenCode", null);
function isCodeModification(value) {
    return (value &&
        typeof value === 'object' &&
        value.from !== undefined &&
        value.to !== undefined);
}
/**
 * Create a code modification that inserts a piece of code.
 *
 * @remarks
 * Should be used in conjunction with {@link CodeBlock.edit}.
 *
 * @param content - The code to insert.
 */
export function insert(content) {
    return {
        from: '',
        to: content,
    };
}
/**
 * Create a code modification that removes a piece of code.
 *
 * @remarks
 * Should be used in conjunction with {@link CodeBlock.edit}.
 *
 * @param content - The code to remove.
 */
export function remove(content) {
    return {
        from: content,
        to: '',
    };
}
/**
 * Create a code modification that changes one piece of code into another.
 *
 * @remarks
 * Should be used in conjunction with {@link CodeBlock.edit}.
 *
 * @param from - The code to change from.
 * @param to - The code to change to.
 */
export function edit(from, to) {
    return { from, to };
}
/**
 * Create a selection range that highlights the given lines.
 *
 * @param from - The line from which the selection starts.
 * @param to - The line at which the selection ends. If omitted, the selection
 *             will cover only one line.
 */
export function lines(from, to) {
    return [
        [
            [from, 0],
            [to ?? from, Infinity],
        ],
    ];
}
/**
 * Create a selection range that highlights the given word.
 *
 * @param line - The line at which the word appears.
 * @param from - The column at which the word starts.
 * @param length - The length of the word. If omitted, the selection will cover
 *                 the rest of the line.
 */
export function word(line, from, length) {
    return [
        [
            [line, from],
            [line, from + (length ?? Infinity)],
        ],
    ];
}
/**
 * Create a custom selection range.
 *
 * @param startLine - The line at which the selection starts.
 * @param startColumn - The column at which the selection starts.
 * @param endLine - The line at which the selection ends.
 * @param endColumn - The column at which the selection ends.
 */
export function range(startLine, startColumn, endLine, endColumn) {
    return [
        [
            [startLine, startColumn],
            [endLine, endColumn],
        ],
    ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29kZUJsb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvQ29kZUJsb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDaEUsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3hELE9BQU8sRUFBQyxLQUFLLEVBQWEsTUFBTSxTQUFTLENBQUM7QUFDMUMsT0FBTyxFQUVMLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxHQUtOLE1BQU0sVUFBVSxDQUFDO0FBQ2xCLE9BQU8sRUFDTCxVQUFVLEVBQ1YsYUFBYSxFQUNiLEdBQUcsRUFFSCxLQUFLLEdBQ04sTUFBTSxrQ0FBa0MsQ0FBQztBQUMxQyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFFOUQsT0FBTyxFQUFvQixPQUFPLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUN6RSxPQUFPLEVBQ0wsbUJBQW1CLEVBQ25CLFlBQVksR0FJYixNQUFNLGlDQUFpQyxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxJQUFJLEVBQWtCLE1BQU0sbUNBQW1DLENBQUM7QUFDeEUsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBa0JyRCxNQUFNLE9BQU8sU0FBVSxTQUFRLEtBQUs7SUErQnhCLENBQUMsY0FBYyxDQUN2QixLQUFrQixFQUNsQixRQUFnQixFQUNoQixjQUE4QjtRQUU5QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJB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