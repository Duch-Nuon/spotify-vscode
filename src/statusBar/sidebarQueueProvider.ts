import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { isLoggedIn } from "../auth/authProvider.js";
import { getQueueInfo } from "../player/playerState.js";

export class SidebarQueueProvider implements vscode.WebviewViewProvider {

    public static readonly viewId = "spotifyQueueInfoView";

    private _view?: vscode.WebviewView;

    private _lastTrackInfo?: { title: string; artist: string; albumArtUrl: string, isPlaying?: boolean, context_uri?: string };

    constructor(private readonly context: vscode.ExtensionContext) { }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri],
        };

        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                if (this._lastTrackInfo) {
                    this.updateQueueInfo(
                        this._lastTrackInfo.title,
                        this._lastTrackInfo.artist,
                        this._lastTrackInfo.albumArtUrl,
                        this._lastTrackInfo.isPlaying,
                        this._lastTrackInfo.context_uri
                    );
                }
            }
        });

        // Show the right view based on login state
        this.updateView();

        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case "playTrackInQueue":
                    vscode.commands.executeCommand("spotify-vscode.playTrackInQueue", message);
                    break;
            }
        });
    }

    /** Call this after login/logout to refresh the sidebar. */
    public async updateView(): Promise<void> {
        if (!this._view) {
            return;
        }

        const loggedIn = await isLoggedIn();
        const htmlFile = loggedIn ? "queue-info.html" : "login.html";
        this._view.webview.html = await this.loadHtml(this._view.webview, htmlFile);
    }

    private async loadHtml(webview: vscode.Webview, filename: string): Promise<string> {
        const filePath = path.join(this.context.extensionPath, "dist", "views", filename);
        let html = fs.readFileSync(filePath, "utf-8");

        const queueInfo = await getQueueInfo();

        if (queueInfo && queueInfo.currently_playing && queueInfo.queue) {

            queueInfo.queue.unshift(queueInfo.currently_playing);

            const injected = `
                <script>
                    const vscode = acquireVsCodeApi();
                    var queueData = ${JSON.stringify(queueInfo.queue)};
                </script>
            `;
            // Inject before </head> so it's available when body scripts run
            html = html.replace('</head>', `${injected}</head>`);
        }else{

            const injected = `
                <script>
                    const vscode = acquireVsCodeApi();
                    var queueData = ${JSON.stringify([])};
                </script>
            `;
            
            html = html.replace('</head>', `${injected}</head>`);
        }

        return html;
    }

    public updateQueueInfo(title: string, artist: string, albumArtUrl: string, isPlaying?: boolean, context_uri?: string) {

        if (!this._view){
            return;
        }

        this._lastTrackInfo = { title, artist, albumArtUrl, isPlaying, context_uri };

        this._view.webview.postMessage({
            title,
            artist,
            albumArtUrl,
            isPlaying,
            context_uri
        });
    }

    public reRenderQueueUI(queueData: any) {

        if (!this._view) {
            return;
        }

        this._view.webview.postMessage({
            command: "updateQueue",
            queueData
        });
    }
}