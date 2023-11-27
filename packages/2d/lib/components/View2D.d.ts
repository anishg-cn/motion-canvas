import { Rect, RectProps } from './Rect';
import { PlaybackState } from '@motion-canvas/core';
import { SimpleSignal } from '@motion-canvas/core/lib/signals';
export interface View2DProps extends RectProps {
    assetHash: string;
}
export declare class View2D extends Rect {
    static shadowRoot: ShadowRoot;
    readonly playbackState: SimpleSignal<PlaybackState, this>;
    readonly assetHash: SimpleSignal<string, this>;
    constructor(props: View2DProps);
    protected transformContext(): void;
    dispose(): void;
    render(context: CanvasRenderingContext2D): void;
    protected requestLayoutUpdate(): void;
    protected requestFontUpdate(): void;
    view(): View2D;
}
//# sourceMappingURL=View2D.d.ts.map