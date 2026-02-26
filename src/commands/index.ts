import * as vscode from 'vscode';
import { registerPlayCommand } from './play';
import { registerNextCommand } from './next';
import { registerPreviousCommand } from './previous';
import { registerFavoriteCommand } from './favorite';
import { registerLoginCommand } from './login';
import type { SidebarProvider } from '../statusBar/sidebarProvider.js';
import { registerLogoutCommand } from './logout';
import { StatusBarProvider } from '../statusBar/statusBarProvider';
import { registerPlayTrackInQueueCommand } from './playTrackInQueue';

export function registerAllCommands(context: vscode.ExtensionContext, sidebarProvider: SidebarProvider, statusBarProvider: StatusBarProvider): void {
  context.subscriptions.push(
    registerPlayCommand(context, statusBarProvider, sidebarProvider),
    registerNextCommand(context, statusBarProvider, sidebarProvider),
    registerPreviousCommand(context, statusBarProvider, sidebarProvider),
    registerFavoriteCommand(context),
    registerLoginCommand(context, sidebarProvider, statusBarProvider),
    registerLogoutCommand(context, sidebarProvider, statusBarProvider),
    registerPlayTrackInQueueCommand(context, statusBarProvider, sidebarProvider)
  );
}
