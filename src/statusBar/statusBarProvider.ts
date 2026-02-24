import * as vscode from "vscode";
import { trackPoller } from "../extension.js";
import { isLoggedIn } from "../auth/authProvider.js";
import { TrackInfo } from "../player/trackPoller.js";

export class StatusBarProvider {
    private _playPauseItem: vscode.StatusBarItem;
    private _trackItem: vscode.StatusBarItem;
    private _nextItem: vscode.StatusBarItem;
    private _prevItem: vscode.StatusBarItem;
    private _unsubscribe: () => void;

    constructor(private readonly context: vscode.ExtensionContext) {
        // create status bar items with priority (higher = more left)
        this._prevItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 96);
        this._playPauseItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 95);
        this._nextItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 94);
        this._trackItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 93);

        this._prevItem.command = "spotify-vscode.previous";
        this._playPauseItem.command = "spotify-vscode.togglePlay";
        this._nextItem.command = "spotify-vscode.next";

        this._prevItem.text = "$(chevron-left)";
        this._playPauseItem.text = "$(play)";
        this._nextItem.text = "$(chevron-right)";
        this._trackItem.text = "$(music) Not Playing";

        this._prevItem.tooltip = "Previous Track";
        this._playPauseItem.tooltip = "Play / Pause";
        this._nextItem.tooltip = "Next Track";

        // subscribe to track changes
        this._unsubscribe = trackPoller.onTrackChanged((track) => {
            this.updateTrack(track);
        });

        // register disposables
        context.subscriptions.push(
            this._prevItem,
            this._playPauseItem,
            this._nextItem,
            this._trackItem,
            { dispose: () => this._unsubscribe() }
        );

        this.init();
    }

    public async init() {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            this.show();
        } else {
            this.hide();
        }
    }

    private updateTrack(track: TrackInfo) {
        this._trackItem.text = `$(music) ${track.name}  —  ${track.artist}`;
        this._trackItem.tooltip = `${track.name} by ${track.artist}`;
        this._playPauseItem.text = track.isPlaying ? "$(debug-pause)" : "$(debug-start)"; // 👈
    }

    public show() {
        this._prevItem.show();
        this._playPauseItem.show();
        this._nextItem.show();
        this._trackItem.show();
    }

    public hide() {
        this._prevItem.hide();
        this._playPauseItem.hide();
        this._nextItem.hide();
        this._trackItem.hide();
    }

    public setPlaying(isPlaying: boolean) {
        this._playPauseItem.text = isPlaying ? "$(debug-pause)" : "$(play)";
    }

    public onLogin() {
        this.show();
    }

    public onLogout() {
        this._trackItem.text = "$(music) Not Playing";
        this._playPauseItem.text = "$(play)";
        this.hide();
    }
}