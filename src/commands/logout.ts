import * as vscode from 'vscode';
import { logout } from '../auth/authProvider.js';
import type { SidebarProvider } from '../statusBar/sidebarProvider.js';

export function registerLogoutCommand(context: vscode.ExtensionContext, sidebarProvider: SidebarProvider): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.logout', async () => {
    try {
      await logout();
      await sidebarProvider.updateView();
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to log out – ${error}`);
    }
  });
}
