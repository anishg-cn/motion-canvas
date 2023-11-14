import {Canvas as $Canvas, CanvasRenderingContext2D, Image} from 'skia-canvas';
import {getContext} from '../utils';

let Canvas: $Canvas;
let Context: CanvasRenderingContext2D;

export type ImageDataSource = CanvasImageSource & {
  width: number;
  height: number;
};

export function loadImage(source: string): Promise<Image> {
  const image = new Image();
  image.src = source;
  return new Promise((resolve, reject) => {
    if (image.complete) {
      resolve(image);
    } else {
      image.onload = () => resolve(image);
      image.onerror = reject;
    }
  });
}

export function loadAnimation(sources: string[]): Promise<Image[]> {
  return Promise.all(sources.map(loadImage));
}

export function getImageData(image: Image) {
  Canvas ??= new $Canvas();
  Context ??= getContext({willReadFrequently: true}, Canvas);

  Canvas.width = image.width;
  Canvas.height = image.height;
  Context.clearRect(0, 0, image.width, image.height);
  Context.drawImage(image, 0, 0);

  return Context.getImageData(0, 0, image.width, image.height);
}
