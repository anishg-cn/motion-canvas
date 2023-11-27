var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _a;
import { computed, initial, signal } from '../decorators';
import { Color, BBox, Vector2, } from '@motion-canvas/core/lib/types';
import { drawImage } from '../utils';
import { Rect } from './Rect';
import { DependencyContext, } from '@motion-canvas/core/lib/signals';
import { useLogger, viaProxy } from '@motion-canvas/core/lib/utils';
/**
 * A node for displaying images.
 *
 * @preview
 * ```tsx editor
 * import {Img} from '@motion-canvas/2d/lib/components';
 * import {all, waitFor} from '@motion-canvas/core/lib/flow';
 * import {createRef} from '@motion-canvas/core/lib/utils';
 * import {makeScene2D} from '@motion-canvas/2d';
 *
 * export default makeScene2D(function* (view) {
 *   const ref = createRef<Img>();
 *   yield view.add(
 *     <Img
 *       ref={ref}
 *       src="https://images.unsplash.com/photo-1679218407381-a6f1660d60e9"
 *       width={300}
 *       radius={20}
 *     />,
 *   );
 *
 *   // set the background using the color sampled from the image:
 *   ref().fill(ref().getColorAtPoint(0));
 *
 *   yield* all(
 *     ref().size([100, 100], 1).to([300, null], 1),
 *     ref().radius(50, 1).to(20, 1),
 *     ref().alpha(0, 1).to(1, 1),
 *   );
 *   yield* waitFor(0.5);
 * });
 * ```
 */
export class Img extends Rect {
    constructor(props) {
        super(props);
        if (!('src' in props)) {
            useLogger().warn({
                message: 'No source specified for the image',
                remarks: "<p>The image won&#39;t be visible unless you specify a source:</p>\n<pre><code class=\"language-tsx\"><span class=\"hljs-keyword\">import</span> myImage <span class=\"hljs-keyword\">from</span> <span class=\"hljs-string\">&#x27;./example.png&#x27;</span>;\n<span class=\"hljs-comment\">// ...</span>\n<span class=\"language-xml\"><span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">Img</span> <span class=\"hljs-attr\">src</span>=<span class=\"hljs-string\">{myImage}</span> /&gt;</span></span>;\n</code></pre>\n<p>If you did this intentionally, and don&#39;t want to see this warning, set the <code>src</code>\nproperty to <code>null</code>:</p>\n<pre><code class=\"language-tsx\">&lt;<span class=\"hljs-title class_\">Img</span> src={<span class=\"hljs-literal\">null</span>} /&gt;\n</code></pre>\n<p><a href='https://motioncanvas.io/docs/media#images' target='_blank'>Learn more</a> about working with\nimages.</p>\n",
                inspect: this.key,
            });
        }
    }
    desiredSize() {
        const custom = super.desiredSize();
        if (custom.x === null && custom.y === null) {
            const image = this.image();
            return {
                x: image.naturalWidth,
                y: image.naturalHeight,
            };
        }
        return custom;
    }
    image() {
        const rawSrc = this.src();
        let src = '';
        let key = '';
        if (rawSrc) {
            key = viaProxy(rawSrc);
            const url = new URL(key, window.location.origin);
            if (url.origin === window.location.origin) {
                const hash = this.view().assetHash();
                url.searchParams.set('asset-hash', hash);
            }
            src = url.toString();
        }
        let image = Img.pool[key];
        if (!image) {
            image = document.createElement('img');
            image.crossOrigin = 'anonymous';
            image.src = src;
            Img.pool[key] = image;
        }
        if (!image.complete) {
            DependencyContext.collectPromise(new Promise((resolve, reject) => {
                image.addEventListener('load', resolve);
                image.addEventListener('error', reject);
            }));
        }
        return image;
    }
    imageCanvas() {
        const canvas = document
            .createElement('canvas')
            .getContext('2d', { willReadFrequently: true });
        if (!canvas) {
            throw new Error('Could not create an image canvas');
        }
        return canvas;
    }
    filledImageCanvas() {
        const context = this.imageCanvas();
        const image = this.image();
        context.canvas.width = image.naturalWidth;
        context.canvas.height = image.naturalHeight;
        context.imageSmoothingEnabled = this.smoothing();
        context.drawImage(image, 0, 0);
        return context;
    }
    draw(context) {
        this.drawShape(context);
        const alpha = this.alpha();
        if (alpha > 0) {
            const box = BBox.fromSizeCentered(this.computedSize());
            context.save();
            context.clip(this.getPath());
            if (alpha < 1) {
                context.globalAlpha *= alpha;
            }
            context.imageSmoothingEnabled = this.smoothing();
            drawImage(context, this.image(), box);
            context.restore();
        }
        if (this.clip()) {
            context.clip(this.getPath());
        }
        this.drawChildren(context);
    }
    applyFlex() {
        super.applyFlex();
        const image = this.image();
        this.element.style.aspectRatio = (this.ratio() ?? image.naturalWidth / image.naturalHeight).toString();
    }
    /**
     * Get color of the image at the given position.
     *
     * @param position - The position in local space at which to sample the color.
     */
    getColorAtPoint(position) {
        const size = this.computedSize();
        const naturalSize = this.naturalSize();
        const pixelPosition = new Vector2(position)
            .add(this.computedSize().scale(0.5))
            .mul(naturalSize.div(size).safe);
        return this.getPixelColor(pixelPosition);
    }
    /**
     * The natural size of this image.
     *
     * @remarks
     * The natural size is the size of the source image unaffected by the size
     * and scale properties.
     */
    naturalSize() {
        const image = this.image();
        return new Vector2(image.naturalWidth, image.naturalHeight);
    }
    /**
     * Get color of the image at the given pixel.
     *
     * @param position - The pixel's position.
     */
    getPixelColor(position) {
        const context = this.filledImageCanvas();
        const vector = new Vector2(position);
        const data = context.getImageData(vector.x, vector.y, 1, 1).data;
        return new Color({
            r: data[0],
            g: data[1],
            b: data[2],
            a: data[3] / 255,
        });
    }
    collectAsyncResources() {
        super.collectAsyncResources();
        this.image();
    }
}
_a = Img;
Img.pool = {};
(() => {
    if (import.meta.hot) {
        import.meta.hot.on('motion-canvas:assets', ({ urls }) => {
            for (const url of urls) {
                if (_a.pool[url]) {
                    delete _a.pool[url];
                }
            }
        });
    }
})();
__decorate([
    signal()
], Img.prototype, "src", void 0);
__decorate([
    initial(1),
    signal()
], Img.prototype, "alpha", void 0);
__decorate([
    initial(true),
    signal()
], Img.prototype, "smoothing", void 0);
__decorate([
    computed()
], Img.prototype, "image", null);
__decorate([
    computed()
], Img.prototype, "imageCanvas", null);
__decorate([
    computed()
], Img.prototype, "filledImageCanvas", null);
__decorate([
    computed()
], Img.prototype, "naturalSize", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW1nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvSW1nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDeEQsT0FBTyxFQUNMLEtBQUssRUFFTCxJQUFJLEVBRUosT0FBTyxHQUNSLE1BQU0sK0JBQStCLENBQUM7QUFDdkMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNuQyxPQUFPLEVBQUMsSUFBSSxFQUFZLE1BQU0sUUFBUSxDQUFDO0FBRXZDLE9BQU8sRUFDTCxpQkFBaUIsR0FHbEIsTUFBTSxpQ0FBaUMsQ0FBQztBQUN6QyxPQUFPLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBa0JsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQ0c7QUFDSCxNQUFNLE9BQU8sR0FBSSxTQUFRLElBQUk7SUF5RDNCLFlBQW1CLEtBQWU7UUFDaEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2IsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQztnQkFDZixPQUFPLEVBQUUsbUNBQW1DO2dCQUM1QyxPQUFPLDg1QkFBb0I7Z0JBQzNCLE9BQU8sRUFBRSxJQUFJLENBQUMsR0FBRzthQUNsQixDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUFFa0IsV0FBVztRQUM1QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkMsSUFBSSxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUMxQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7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