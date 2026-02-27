import * as vscode from 'vscode';
import { logout } from '../auth/authProvider.js';
import type { SidebarProvider } from '../statusBar/sidebarProvider.js';
import { StatusBarProvider } from '../statusBar/statusBarProvider.js';
import { SidebarQueueProvider } from '../statusBar/sidebarQueueProvider.js';

export function registerLogoutCommand(context: vscode.ExtensionContext, sidebarProvider: SidebarProvider, statusBarProvider: StatusBarProvider, sidebarQueueProvider: SidebarQueueProvider): vscode.Disposable {
  return vscode.commands.registerCommand('spotify-vscode.logout', async () => {
    try {
      await logout();
      await sidebarProvider.updateView();
      await sidebarQueueProvider.updateView();
      await statusBarProvider.onLogout();
    } catch (error) {
      vscode.window.showErrorMessage(`Spotify: Failed to log out – ${error}`);
    }
  });
}
