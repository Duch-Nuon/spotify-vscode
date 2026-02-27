import * as vscode from 'vscode';
import { loginWithSpotify } from '../auth/authProvider.js';
import type { SidebarProvider } from '../statusBar/sidebarProvider.js';
import { StatusBarProvider } from '../statusBar/statusBarProvider.js';
import { SidebarQueueProvider } from '../statusBar/sidebarQueueProvider.js';

export function registerLoginCommand(context: vscode.ExtensionContext, sidebarProvider: SidebarProvider, statusBarProvider: StatusBarProvider, sidebarQueueProvider: SidebarQueueProvider): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.login', async () => {
    try {
      const token = await loginWithSpotify();
      if (token) {
        // Refresh sidebar to show player view
        await sidebarProvider.updateView();
        await statusBarProvider.onLogin();
        await sidebarQueueProvider.updateView();
      
      } else {
        vscode.window.showErrorMessage('Spotify: Failed to log in');
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to log in – ${error}`);
    }
  });
}
