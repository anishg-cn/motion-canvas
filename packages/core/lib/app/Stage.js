import { Canvas } from 'skia-canvas';
import { unwrap } from '../signals';
import { Vector2 } from '../types';
import { getContext } from '../utils';
/**
 * Manages canvases on which an animation can be displayed.
 */
export class Stage {
    get canvasSize() {
        return this.size.scale(this.resolutionScale);
    }
    constructor() {
        // TODO Consider adding pooling for canvases.
        this.background = null;
        this.resolutionScale = 1;
        this.colorSpace = 'srgb';
        this.size = Vector2.zero;
        this.finalBuffer = new Canvas();
        this.currentBuffer = new Canvas();
        this.previousBuffer = new Canvas();
        const colorSpace = this.colorSpace;
        this.context = getContext({ colorSpace }, this.finalBuffer);
        this.currentContext = getContext({ colorSpace }, this.currentBuffer);
        this.previousContext = getContext({ colorSpace }, this.previousBuffer);
    }
    configure({ colorSpace = this.colorSpace, size = this.size, resolutionScale = this.resolutionScale, background = this.background, }) {
        if (colorSpace !== this.colorSpace) {
            this.colorSpace = colorSpace;
            this.context = getContext({ colorSpace }, this.finalBuffer);
            this.currentContext = getContext({ colorSpace }, this.currentBuffer);
            this.previousContext = getContext({ colorSpace }, this.previousBuffer);
        }
        if (!size.exactlyEquals(this.size) ||
            resolutionScale !== this.resolutionScale) {
            this.resolutionScale = resolutionScale;
            this.size = size;
            this.resizeCanvas(this.context);
            this.resizeCanvas(this.currentContext);
            this.resizeCanvas(this.previousContext);
        }
        this.background =
            typeof background === 'string'
                ? background
                : background?.serialize() ?? null;
    }
    async render(currentScene, previousScene) {
        const previousOnTop = previousScene
            ? unwrap(currentScene.previousOnTop)
            : false;
        if (previousScene) {
            this.transformCanvas(this.previousContext);
            await previousScene.render(this.previousContext);
        }
        this.transformCanvas(this.currentContext);
        await currentScene.render(this.currentContext);
        const size = this.canvasSize;
        this.context.clearRect(0, 0, size.width, size.height);
        if (this.background) {
            this.context.save();
            this.context.fillStyle = this.background;
            this.context.fillRect(0, 0, size.width, size.height);
            this.context.restore();
        }
        if (previousScene && !previousOnTop) {
            this.context.drawImage(this.previousBuffer, 0, 0);
        }
        this.context.drawImage(this.currentBuffer, 0, 0);
        if (previousOnTop) {
            this.context.drawImage(this.previousBuffer, 0, 0);
        }
    }
    transformCanvas(context) {
        const offset = this.canvasSize.scale(0.5);
        context.setTransform(this.resolutionScale, 0, 0, this.resolutionScale, offset.x, offset.y);
    }
    resizeCanvas(context) {
        const size = this.canvasSize;
        context.canvas.width = size.width;
        context.canvas.height = size.height;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXBwL1N0YWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxNQUFNLEVBQTJCLE1BQU0sYUFBYSxDQUFDO0FBRTdELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFbEMsT0FBTyxFQUFtQixPQUFPLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDbkQsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQVNwQzs7R0FFRztBQUNILE1BQU0sT0FBTyxLQUFLO0lBZ0JoQixJQUFZLFVBQVU7UUFDcEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVEO1FBbkJBLDZDQUE2QztRQUVyQyxlQUFVLEdBQWtCLElBQUksQ0FBQztRQUNqQyxvQkFBZSxHQUFHLENBQUMsQ0FBQztRQUNwQixlQUFVLEdBQXFCLE1BQU0sQ0FBQztRQUN0QyxTQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQWUxQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUVuQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLEVBQUMsVUFBVSxFQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDLEVBQUMsVUFBVSxFQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxlQUFlLEdBQUcs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