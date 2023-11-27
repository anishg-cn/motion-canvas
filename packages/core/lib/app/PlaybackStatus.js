/**
 * A read-only representation of the playback.
 */
export class PlaybackStatus {
    constructor(playback) {
        this.playback = playback;
    }
    /**
     * Convert seconds to frames using the current framerate.
     *
     * @param seconds - The seconds to convert.
     */
    secondsToFrames(seconds) {
        return Math.ceil(seconds * this.playback.fps);
    }
    /**
     * Convert frames to seconds using the current framerate.
     *
     * @param frames - The frames to convert.
     */
    framesToSeconds(frames) {
        return frames / this.playback.fps;
    }
    get time() {
        return this.framesToSeconds(this.playback.frame);
    }
    get frame() {
        return this.playback.frame;
    }
    get speed() {
        return this.playback.speed;
    }
    get fps() {
        return this.playback.fps;
    }
    get state() {
        return this.playback.state;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWJhY2tTdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXBwL1BsYXliYWNrU3RhdHVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUFDekIsWUFBb0MsUUFBeUI7UUFBekIsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7SUFBRyxDQUFDO0lBRWpFOzs7O09BSUc7SUFDSSxlQUFlLENBQUMsT0FBZTtRQUNwQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxlQUFlLENBQUMsTUFBYztRQUNuQyxPQUFPLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUNwQyxDQUFDO0lBRUQsSUFBVyxJQUFJO1FBQ2IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELElBQVcsS0FBSztRQUNkLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQUVELElBQVcsS0FBSztRQUNkLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQUVELElBQVcsR0FBRztRQUNaLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQVcsS0FBSztRQUNkLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7SUFDN0IsQ0FBQztDQUNGIn0=