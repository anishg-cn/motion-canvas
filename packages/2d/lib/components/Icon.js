var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Img } from './Img';
import { colorSignal, computed, initial, signal } from '../decorators';
import { useLogger } from '@motion-canvas/core/lib/utils';
/**
 * An Icon Component that provides easy access to over 150k icons.
 * See https://icones.js.org/collection/all for all available Icons.
 */
export class Icon extends Img {
    constructor(props) {
        super(props);
    }
    /**
     * Create the URL that will be used as the Image source
     * @returns Address to Iconify API for the requested Icon.
     */
    svgUrl() {
        const iconPathSegment = this.icon().replace(':', '/');
        const encodedColorValue = encodeURIComponent(this.color().hex());
        // Iconify API is documented here: https://docs.iconify.design/api/svg.html#color
        return `https://api.iconify.design/${iconPathSegment}.svg?color=${encodedColorValue}`;
    }
    /**
     * overrides `Image.src` getter
     */
    getSrc() {
        return this.svgUrl();
    }
    /**
     * overrides `Image.src` setter to warn the user that the value
     * is not used
     */
    setSrc() {
        useLogger().warn("The Icon Component does not accept setting the `src`. If you need access to `src`, use '<Img/>` instead.");
    }
}
__decorate([
    signal()
], Icon.prototype, "icon", void 0);
__decorate([
    initial('white'),
    colorSignal()
], Icon.prototype, "color", void 0);
__decorate([
    computed()
], Icon.prototype, "svgUrl", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL0ljb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFDLEdBQUcsRUFBVyxNQUFNLE9BQU8sQ0FBQztBQUNwQyxPQUFPLEVBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXJFLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQWV4RDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sSUFBSyxTQUFRLEdBQUc7SUE4QjNCLFlBQW1CLEtBQWdCO1FBQ2pDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFRDs7O09BR0c7SUFFTyxNQUFNO1FBQ2QsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEQsTUFBTSxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNqRSxpRkFBaUY7UUFDakYsT0FBTyw4QkFBOEIsZUFBZSxjQUFjLGlCQUFpQixFQUFFLENBQUM7SUFDeEYsQ0FBQztJQUVEOztPQUVHO0lBQ08sTUFBTTtRQUNkLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7O09BR0c7SUFDTyxNQUFNO1FBQ2QsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUNkLDBHQUEwRyxDQUMzRyxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBbERDO0lBREMsTUFBTSxFQUFFO2tDQUN1QztBQWdCaEQ7SUFGQyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQ2hCLFdBQVcsRUFBRTttQ0FDMEI7QUFXeEM7SUFEQyxRQUFRLEVBQUU7a0NBTVYifQ==