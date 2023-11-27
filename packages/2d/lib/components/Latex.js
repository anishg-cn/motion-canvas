var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { mathjax } from 'mathjax-full/js/mathjax';
import { TeX } from 'mathjax-full/js/input/tex';
import { SVG } from 'mathjax-full/js/output/svg';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';
import { initial, signal } from '../decorators';
import { Img } from './Img';
import { DependencyContext, } from '@motion-canvas/core/lib/signals';
import { useLogger } from '@motion-canvas/core/lib/utils';
const Adaptor = liteAdaptor();
RegisterHTMLHandler(Adaptor);
const JaxDocument = mathjax.document('', {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    InputJax: new TeX({ packages: AllPackages }),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    OutputJax: new SVG({ fontCache: 'local' }),
});
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
export class Latex extends Img {
    constructor(props) {
        super(props);
        this.imageElement = document.createElement('img');
    }
    image() {
        // Render props may change the look of the TeX, so we need to cache both
        // source and render props together.
        const src = `${this.tex()}::${JSON.stringify(this.options())}`;
        if (Latex.svgContentsPool[src]) {
            this.imageElement.src = Latex.svgContentsPool[src];
            if (!this.imageElement.complete) {
                DependencyContext.collectPromise(new Promise((resolve, reject) => {
                    this.imageElement.addEventListener('load', resolve);
                    this.imageElement.addEventListener('error', reject);
                }));
            }
            return this.imageElement;
        }
        // Convert to TeX, look for any errors
        const tex = this.tex();
        const svg = Adaptor.innerHTML(JaxDocument.convert(tex, this.options()));
        if (svg.includes('data-mjx-error')) {
            const errors = svg.match(/data-mjx-error="(.*?)"/);
            if (errors && errors.length > 0) {
                useLogger().error(`Invalid MathJax: ${errors[1]}`);
            }
        }
        // Encode to raw base64 image format
        const text = `data:image/svg+xml;base64,${btoa(`<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n${svg}`)}`;
        Latex.svgContentsPool[src] = text;
        const image = document.createElement('img');
        image.src = text;
        image.src = text;
        if (!image.complete) {
            DependencyContext.collectPromise(new Promise((resolve, reject) => {
                image.addEventListener('load', resolve);
                image.addEventListener('error', reject);
            }));
        }
        return image;
    }
}
Latex.svgContentsPool = {};
__decorate([
    initial({}),
    signal()
], Latex.prototype, "options", void 0);
__decorate([
    signal()
], Latex.prototype, "tex", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGF0ZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9MYXRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDaEQsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUMvQyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sdUNBQXVDLENBQUM7QUFDbEUsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ2pFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ2xFLE9BQU8sRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzlDLE9BQU8sRUFBQyxHQUFHLEVBQVcsTUFBTSxPQUFPLENBQUM7QUFDcEMsT0FBTyxFQUNMLGlCQUFpQixHQUdsQixNQUFNLGlDQUFpQyxDQUFDO0FBRXpDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUV4RCxNQUFNLE9BQU8sR0FBRyxXQUFXLEVBQUUsQ0FBQztBQUM5QixtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUU3QixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRTtJQUN2QyxnRUFBZ0U7SUFDaEUsUUFBUSxFQUFFLElBQUksR0FBRyxDQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBQyxDQUFDO0lBQzFDLGdFQUFnRTtJQUNoRSxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLENBQUM7Q0FDekMsQ0FBQyxDQUFDO0FBT0g7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBQ0gsTUFBTSxPQUFPLEtBQU0sU0FBUSxHQUFH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