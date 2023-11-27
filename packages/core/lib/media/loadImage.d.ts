import { Image } from 'skia-canvas';
export type ImageDataSource = CanvasImageSource & {
    width: number;
    height: number;
};
export declare function loadImage(source: string): Promise<Image>;
export declare function loadAnimation(sources: string[]): Promise<Image[]>;
export declare function getImageData(image: Image): ImageData;
//# sourceMappingURL=loadImage.d.ts.map