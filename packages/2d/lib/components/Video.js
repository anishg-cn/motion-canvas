var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BBox } from '@motion-canvas/core/lib/types';
import { drawImage } from '../utils';
import { computed, initial, signal } from '../decorators';
import { useThread } from '@motion-canvas/core/lib/utils';
import { PlaybackState } from '@motion-canvas/core';
import { clamp } from '@motion-canvas/core/lib/tweening';
import { Rect } from './Rect';
import { DependencyContext, } from '@motion-canvas/core/lib/signals';
export class Video extends Rect {
    constructor({ play, ...props }) {
        super(props);
        this.lastTime = -1;
        if (play) {
            this.play();
        }
    }
    isPlaying() {
        return this.playing();
    }
    getCurrentTime() {
        return this.clampTime(this.time());
    }
    getDuration() {
        return this.video().duration;
    }
    desiredSize() {
        const custom = super.desiredSize();
        if (custom.x === null && custom.y === null) {
            const image = this.video();
            return {
                x: image.videoWidth,
                y: image.videoHeight,
            };
        }
        return custom;
    }
    completion() {
        return this.clampTime(this.time()) / this.video().duration;
    }
    video() {
        const src = this.src();
        const key = `${this.key}/${src}`;
        let video = Video.pool[key];
        if (!video) {
            video = document.createElement('video');
            video.src = src;
            Video.pool[key] = video;
        }
        if (video.readyState < 2) {
            DependencyContext.collectPromise(new Promise(resolve => {
                const listener = () => {
                    resolve();
                    video.removeEventListener('canplay', listener);
                };
                video.addEventListener('canplay', listener);
            }));
        }
        return video;
    }
    seekedVideo() {
        const video = this.video();
        const time = this.clampTime(this.time());
        if (!video.paused) {
            video.pause();
        }
        if (this.lastTime === time) {
            return video;
        }
        this.setCurrentTime(time);
        return video;
    }
    fastSeekedVideo() {
        const video = this.video();
        const time = this.clampTime(this.time());
        if (this.lastTime === time) {
            return video;
        }
        const playing = this.playing() && time < video.duration;
        if (playing) {
            if (video.paused) {
                DependencyContext.collectPromise(video.play());
            }
        }
        else {
            if (!video.paused) {
                video.pause();
            }
        }
        if (Math.abs(video.currentTime - time) > 0.2) {
            this.setCurrentTime(time);
        }
        else if (!playing) {
            video.currentTime = time;
        }
        return video;
    }
    draw(context) {
        this.drawShape(context);
        const alpha = this.alpha();
        if (alpha > 0) {
            const playbackState = this.view().playbackState();
            const video = playbackState === PlaybackState.Playing ||
                playbackState === PlaybackState.Presenting
                ? this.fastSeekedVideo()
                : this.seekedVideo();
            const box = BBox.fromSizeCentered(this.computedSize());
            context.save();
            context.clip(this.getPath());
            if (alpha < 1) {
                context.globalAlpha *= alpha;
            }
            context.imageSmoothingEnabled = this.smoothing();
            drawImage(context, video, box);
            context.restore();
        }
        if (this.clip()) {
            context.clip(this.getPath());
        }
        this.drawChildren(context);
    }
    applyFlex() {
        super.applyFlex();
        const video = this.video();
        this.element.style.aspectRatio = (this.ratio() ?? video.videoWidth / video.videoHeight).toString();
    }
    setCurrentTime(value) {
        const video = this.video();
        if (video.readyState < 2)
            return;
        video.currentTime = value;
        this.lastTime = value;
        if (video.seeking) {
            DependencyContext.collectPromise(new Promise(resolve => {
                const listener = () => {
                    resolve();
                    video.removeEventListener('seeked', listener);
                };
                video.addEventListener('seeked', listener);
            }));
        }
    }
    play() {
        const time = useThread().time;
        const start = time() - this.time();
        this.playing(true);
        this.time(() => this.clampTime(time() - start));
    }
    pause() {
        this.playing(false);
        this.time.save();
        this.video().pause();
    }
    seek(time) {
        const playing = this.playing();
        this.time(this.clampTime(time));
        if (playing) {
            this.play();
        }
        else {
            this.pause();
        }
    }
    clampTime(time) {
        const duration = this.video().duration;
        if (this.loop()) {
            time %= duration;
        }
        return clamp(0, duration, time);
    }
    collectAsyncResources() {
        super.collectAsyncResources();
        this.seekedVideo();
    }
}
Video.pool = {};
__decorate([
    signal()
], Video.prototype, "src", void 0);
__decorate([
    initial(1),
    signal()
], Video.prototype, "alpha", void 0);
__decorate([
    initial(true),
    signal()
], Video.prototype, "smoothing", void 0);
__decorate([
    initial(false),
    signal()
], Video.prototype, "loop", void 0);
__decorate([
    initial(0),
    signal()
], Video.prototype, "time", void 0);
__decorate([
    initial(false),
    signal()
], Video.prototype, "playing", void 0);
__decorate([
    computed()
], Video.prototype, "completion", null);
__decorate([
    computed()
], Video.prototype, "video", null);
__decorate([
    computed()
], Video.prototype, "seekedVideo", null);
__decorate([
    computed()
], Video.prototype, "fastSeekedVideo", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9WaWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUMsSUFBSSxFQUFvQixNQUFNLCtCQUErQixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDbkMsT0FBTyxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3hELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUN4RCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ3ZELE9BQU8sRUFBQyxJQUFJLEVBQVksTUFBTSxRQUFRLENBQUM7QUFFdkMsT0FBTyxFQUNMLGlCQUFpQixHQUdsQixNQUFNLGlDQUFpQyxDQUFDO0FBMEJ6QyxNQUFNLE9BQU8sS0FBTSxTQUFRLElBQUk7SUE4RDdCLFlBQW1CLEVBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxFQUFhO1FBQzdDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUhQLGFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUlwQixJQUFJLElBQUksRUFBRTtZQUNSLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNiO0lBQ0gsQ0FBQztJQUVNLFNBQVM7UUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRU0sY0FBYztRQUNuQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVNLFdBQVc7UUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDO0lBQy9CLENBQUM7SUFFa0IsV0FBVztR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