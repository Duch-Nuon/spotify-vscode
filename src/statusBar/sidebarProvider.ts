import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { isLoggedIn } from "../auth/authProvider.js";

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

        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case "login":
                    vscode.commands.executeCommand("spotify-vscode.login");
                    break;
                case "logout":
                    vscode.commands.executeCommand("spotify-vscode.logout");
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
        const htmlFile = loggedIn ? "player.html" : "login.html";
        this._view.webview.html = this.loadHtml(this._view.webview, htmlFile);
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
}
