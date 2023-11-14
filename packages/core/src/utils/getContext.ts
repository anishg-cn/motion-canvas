import {Canvas, CanvasRenderingContext2D} from 'skia-canvas';

export function getContext(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  options?: CanvasRenderingContext2DSettings,
  canvas: Canvas = new Canvas(),
): CanvasRenderingContext2D {
  // FIXME: add support for `options` in `getContext()`
  // const context = canvas.getContext('2d', options);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not create a 2D context.');
  }
  return context;
}
