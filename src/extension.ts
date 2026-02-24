import * as vscode from 'vscode';
import { SidebarProvider } from './statusBar/sidebarProvider.js';
import { registerAllCommands } from './commands/index.js';
import { initAuth } from './auth/authProvider.js';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Initialize auth (must be first — other modules depend on tokenStorage)
	initAuth(context);

	const sidebarProvider = new SidebarProvider(context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider)
	);

	registerAllCommands(context, sidebarProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
