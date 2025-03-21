import { Img, ImgProps } from './Img';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import { OptionList } from 'mathjax-full/js/util/Options';
export interface LatexProps extends ImgProps {
    tex?: SignalValue<string>;
    renderProps?: SignalValue<OptionList>;
}
/**
 * A node for rendering equations with LaTeX.
 *
 * @preview
 * ```tsx editor
 * import {Latex, makeScene2D} from '@motion-canvas/2d';
 *
 * export default makeScene2D(function* (view) {
 *   view.add(
 *     <Latex
 *       // Note how this uses \color to set the color.
 *       tex="{\color{white} ax^2+bx+c=0 \implies x=\frac{-b \pm \sqrt{b^2-4ac}}{2a}}"
 *       width={600} // height and width can calculate based on each other
 *     />,
 *   );
 * });
 * ```
 */
export declare class Latex extends Img {
    private static svgContentsPool;
    private readonly imageElement;
    readonly options: SimpleSignal<OptionList, this>;
    readonly tex: SimpleSignal<string, this>;
    constructor(props: LatexProps);
    protected image(): HTMLImageElement;
}
//# sourceMappingURL=Latex.d.ts.map