import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { isLoggedIn } from "../auth/authProvider.js";
import { getCurrentTrackInfo } from "../player/playerState.js";

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "spotifySidebarView";
    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) { }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri],
        };

        // Show the right view based on login state
        this.updateView();

        webviewView.webview.onDidReceiveMessage(async (message) => {

            const trackInfo = await getCurrentTrackInfo();

            if (trackInfo) {
                this.updateCurrentTrackInfo(trackInfo.name, trackInfo.artist, trackInfo.albumArtUrl);
            }

            switch (message.command) {

                case "login":
                    vscode.commands.executeCommand("spotify-vscode.login");
                    break;
                case "logout":
                    vscode.commands.executeCommand("spotify-vscode.logout");
                    break;
                case "togglePlay":
                    vscode.commands.executeCommand("spotify-vscode.togglePlay");
                    break;
                case "next":
                    const trackInfo = await getCurrentTrackInfo();
                    if (trackInfo) {
                        this.updateCurrentTrackInfo(trackInfo.name, trackInfo.artist, trackInfo.albumArtUrl);
                    }
                    vscode.commands.executeCommand("spotify-vscode.next");
                    break;
                case "previous":
                    vscode.commands.executeCommand("spotify-vscode.previous");
                    break;
                // case "favorite":
                //     vscode.commands.executeCommand("spotify-vscode.favorite");
                //     break;
            }
        });
    }

    /** Call this after login/logout to refresh the sidebar. */
    public async updateView(): Promise<void> {
        if (!this._view) {
            return;
        }
        const loggedIn = await isLoggedIn();
        const htmlFile = loggedIn ? "player.html" : "login.html";
        this._view.webview.html = this.loadHtml(this._view.webview, htmlFile);

        if(loggedIn) {
            const trackInfo = await getCurrentTrackInfo();
            if (trackInfo) {
                this.updateCurrentTrackInfo(trackInfo.name, trackInfo.artist, trackInfo.albumArtUrl);
            }
        }
    }

    /** Read an HTML file from views/ and replace {{placeholders}} with webview URIs. */
    private loadHtml(webview: vscode.Webview, filename: string): string {
        const filePath = path.join(this.context.extensionPath, "src/views", filename);
        let html = fs.readFileSync(filePath, "utf-8");        

        const spotifyIconUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "spotify-icon.svg"),
        );

        html = html.replace(/\{\{spotifyIconUri\}\}/g, spotifyIconUri.toString());

        return html;
    }

    public updateCurrentTrackInfo(name: string, artist: string, albumArtUrl: string) {

        if (!this._view){
            return;
        }

        this._view.webview.postMessage({
            name,
            artist,
            albumArtUrl
        });
    }   
}
