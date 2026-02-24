import * as vscode from 'vscode';
import { registerPlayCommand } from './play';
import { registerNextCommand } from './next';
import { registerPreviousCommand } from './previous';
import { registerFavoriteCommand } from './favorite';
import { registerLoginCommand } from './login';
import type { SidebarProvider } from '../statusBar/sidebarProvider.js';
import { registerLogoutCommand } from './logout';

export function registerAllCommands(context: vscode.ExtensionContext, sidebarProvider: SidebarProvider): void {
  context.subscriptions.push(
    registerPlayCommand(context),
    registerNextCommand(context),
    registerPreviousCommand(context),
    registerFavoriteCommand(context),
    registerLoginCommand(context, sidebarProvider),
    registerLogoutCommand(context, sidebarProvider)
  );
}
