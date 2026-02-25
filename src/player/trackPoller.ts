import { getCurrentTrackInfo } from "./playerState.js";

export interface TrackInfo {
    name: string;
    artist: string;
    albumArtUrl: string;
    isPlaying?: boolean;
    isDeviceAvailable?: boolean;
}

export class TrackPoller {
    private _interval?: NodeJS.Timeout;
    private _lastTrackInfo?: TrackInfo;
    private _listeners: Set<(track: TrackInfo) => void> = new Set();

    constructor(private readonly intervalMs: number = 1000) {}

    public start() {
        this.stop();
        this._interval = setInterval(async () => {
            const trackInfo = await getCurrentTrackInfo();
            if (!trackInfo){
                return;
            }

            const changed =
                trackInfo.name !== this._lastTrackInfo?.name ||
                trackInfo.artist !== this._lastTrackInfo?.artist ||
                trackInfo.albumArtUrl !== this._lastTrackInfo?.albumArtUrl ||
                trackInfo.isPlaying !== this._lastTrackInfo?.isPlaying ||
                trackInfo.isDeviceAvailable !== this._lastTrackInfo?.isDeviceAvailable;

            if (changed) {
                this._lastTrackInfo = trackInfo;
                this._listeners.forEach(cb => cb(trackInfo));
            }
        }, this.intervalMs);
    }

    public stop() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = undefined;
        }
    }

    public getLastTrackInfo(): TrackInfo | undefined {
        return this._lastTrackInfo;
    }

    public onTrackChanged(cb: (track: TrackInfo) => void): () => void {
        this._listeners.add(cb);
        return () => this._listeners.delete(cb); // returns unsubscribe function
    }

    public isRunning(): boolean {
        return this._interval !== undefined;
    }

    public dispose() {
        this.stop();
        this._listeners.clear();
    }
}