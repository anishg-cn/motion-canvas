import { CanvasRenderingContext2D } from 'skia-canvas';
import { SignalValue } from '../signals/types';
/**
 * Transition to the current scene by altering the Context2D before scenes are rendered.
 *
 * @param current - The callback to use before the current scene is rendered.
 * @param previous - The callback to use before the previous scene is rendered.
 * @param previousOnTop - Whether the previous scene should be rendered on top.
 */
export declare function useTransition(current: (ctx: CanvasRenderingContext2D) => void, previous?: (ctx: CanvasRenderingContext2D) => void, previousOnTop?: SignalValue<boolean>): () => void;
//# sourceMappingURL=useTransition.d.ts.map