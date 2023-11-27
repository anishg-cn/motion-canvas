import { createSceneMetadata, } from '@motion-canvas/core/lib/scenes';
import { Scene2D } from './Scene2D';
export function makeScene2D(runner) {
    return {
        klass: Scene2D,
        config: runner,
        stack: new Error().stack,
        meta: createSceneMetadata(),
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZVNjZW5lMkQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2NlbmVzL21ha2VTY2VuZTJELnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxtQkFBbUIsR0FHcEIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUV4QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRWxDLE1BQU0sVUFBVSxXQUFXLENBQ3pCLE1BQXNDO0lBRXRDLE9BQU87UUFDTCxLQUFLLEVBQUUsT0FBTztRQUNkLE1BQU0sRUFBRSxNQUFNO1FBQ2QsS0FBSyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsS0FBSztRQUN4QixJQUFJLEVBQUUsbUJBQW1CLEVBQUU7S0FDNUIsQ0FBQztBQUNKLENBQUMifQ==