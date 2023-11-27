import { ValueDispatcher } from '../events';
import { useLogger } from '../utils';
export class AudioManager {
    get onDataChanged() {
        return this.data.subscribable;
    }
    constructor(logger) {
        this.logger = logger;
        this.data = new ValueDispatcher(null);
        this.context = new AudioContext();
        this.audioElement = new Audio();
        this.source = null;
        this.error = false;
        this.abortController = null;
        this.offset = 0;
        if (import.meta.hot) {
            import.meta.hot.on('motion-canvas:assets', ({ urls }) => {
                if (this.source && urls.includes(this.source)) {
                    this.setSource(this.source);
                }
            });
        }
    }
    getTime() {
        return this.toAbsoluteTime(this.audioElement.currentTime);
    }
    setTime(value) {
        this.audioElement.currentTime = this.toRelativeTime(value);
    }
    setOffset(value) {
        this.offset = value;
    }
    setMuted(isMuted) {
        this.audioElement.muted = isMuted;
    }
    setSource(src) {
        this.source = src;
        this.audioElement.src = src;
        this.abortController?.abort();
        this.abortController = new AbortController();
        this.loadData(this.abortController.signal).catch(e => {
            if (e.name !== 'AbortError') {
                this.logger.error(e);
            }
        });
    }
    isInRange(time) {
        return time >= this.offset && time < this.audioElement.duration;
    }
    toRelativeTime(time) {
        return Math.max(0, time - this.offset);
    }
    toAbsoluteTime(time) {
        return time + this.offset;
    }
    isReady() {
        return this.source && !this.error;
    }
    /**
     * Pause/resume the audio.
     *
     * @param isPaused - Whether the audio should be paused or resumed.
     *
     * @returns `true` if the audio successfully started playing.
     */
    async setPaused(isPaused) {
        if (this.source && this.audioElement.paused !== isPaused) {
            if (isPaused) {
                this.audioElement.pause();
            }
            else {
                try {
                    await this.audioElement.play();
                    this.error = false;
                    return true;
                }
                catch (e) {
                    if (!this.error) {
                        useLogger().error(e);
                    }
                    this.error = true;
                }
            }
        }
        return false;
    }
    async loadData(signal) {
        this.data.current = null;
        if (!this.source) {
            return;
        }
        const response = await fetch(this.source, { signal });
        const rawBuffer = await response.arrayBuffer();
        if (signal.aborted)
            return;
        let audioBuffer;
        try {
            audioBuffer = await this.decodeAudioData(rawBuffer);
        }
        catch (e) {
            return;
        }
        if (signal.aborted)
            return;
        const sampleSize = 256;
        const samples = ~~(audioBuffer.length / sampleSize);
        const peaks = [];
        let absoluteMax = 0;
        for (let channelId = 0; channelId < audioBuffer.numberOfChannels; channelId++) {
            const channel = audioBuffer.getChannelData(channelId);
            for (let i = 0; i < samples; i++) {
                const start = ~~(i * sampleSize);
                const end = ~~(start + sampleSize);
                let min = channel[start];
                let max = min;
                for (let j = start; j < end; j++) {
                    const value = channel[j];
                    if (value > max) {
                        max = value;
                    }
                    if (value < min) {
                        min = value;
                    }
                }
                if (channelId === 0 || max > peaks[i * 2]) {
                    peaks[i * 2] = max;
                }
                if (channelId === 0 || min < peaks[i * 2 + 1]) {
                    peaks[i * 2 + 1] = min;
                }
                if (max > absoluteMax) {
                    absoluteMax = max;
                }
                if (Math.abs(min) > absoluteMax) {
                    absoluteMax = Math.abs(min);
                }
            }
        }
        this.data.current = {
            peaks,
            absoluteMax,
            length: samples,
            sampleRate: (audioBuffer.sampleRate / sampleSize) * 2,
        };
    }
    decodeAudioData(buffer) {
        return new Promise((resolve, reject) => this.context.decodeAudioData(buffer, resolve, reject).catch(reject));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVkaW9NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21lZGlhL0F1ZGlvTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFHbkMsTUFBTSxPQUFPLFlBQVk7SUFDdkIsSUFBVyxhQUFhO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDaEMsQ0FBQztJQVVELFlBQW9DLE1BQWM7UUFBZCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBVGpDLFNBQUksR0FBRyxJQUFJLGVBQWUsQ0FBbUIsSUFBSSxDQUFDLENBQUM7UUFFbkQsWUFBTyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDN0IsaUJBQVksR0FBcUIsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUN0RCxXQUFNLEdBQWtCLElBQUksQ0FBQztRQUM3QixVQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ2Qsb0JBQWUsR0FBMkIsSUFBSSxDQUFDO1FBQy9DLFdBQU0sR0FBRyxDQUFDLENBQUM7UUFHakIsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxFQUFDLElBQUksRUFBQyxFQUFFLEVBQUU7Z0JBQ3BELElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQzdCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUFDTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFD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