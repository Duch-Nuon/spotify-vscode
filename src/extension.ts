import * as vscode from 'vscode';
import { SidebarProvider } from './statusBar/sidebarProvider.js';
import { registerAllCommands } from './commands/index.js';
import { initAuth } from './auth/authProvider.js';
import { TrackPoller } from './player/trackPoller.js';
import { StatusBarProvider } from './statusBar/statusBarProvider.js';
import { SidebarQueueProvider } from './statusBar/sidebarQueueProvider.js';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export const trackPoller = new TrackPoller(10000);
export async function activate(context: vscode.ExtensionContext) {
	// Initialize auth (must be first — other modules depend on tokenStorage)
	initAuth(context);
	const sidebarProvider = new SidebarProvider(context);
	const statusBarProvider = new StatusBarProvider(context);
	const sidebarQueueProvider = new SidebarQueueProvider(context);

	registerAllCommands(context, sidebarProvider, statusBarProvider, sidebarQueueProvider);

	statusBarProvider.init();
	trackPoller.start();
	context.subscriptions.push({ dispose: () => trackPoller.dispose() });
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider),
	);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(SidebarQueueProvider.viewId, sidebarQueueProvider),
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
