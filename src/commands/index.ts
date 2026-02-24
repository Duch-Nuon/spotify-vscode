import * as vscode from 'vscode';
import { registerPlayCommand } from './play';
import { registerNextCommand } from './next';
import { registerPreviousCommand } from './previous';
import { registerFavoriteCommand } from './favorite';

export function registerAllCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    registerPlayCommand(context),
    registerNextCommand(context),
    registerPreviousCommand(context),
    registerFavoriteCommand(context),
  );
}
