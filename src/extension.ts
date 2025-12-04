import * as vscode from "vscode";
import { RomajaWebviewProvider } from "./providers/RomajaWebviewProvider";
import { convertPreviousWord } from "./commands/convertPreviousWord";

export function activate(context: vscode.ExtensionContext): void {
    console.log("Romaja Helper: activating...");

    // 1. Register Webview Provider
    try {
        const webviewProvider = new RomajaWebviewProvider(context);
        const registration = vscode.window.registerWebviewViewProvider(
            RomajaWebviewProvider.viewType,
            webviewProvider,
            {
                webviewOptions: { retainContextWhenHidden: true }
            }
        );
        
        context.subscriptions.push(registration);
        console.log(`Romaja Helper: Registered provider for ${RomajaWebviewProvider.viewType}`);
    } catch (e) {
        console.error("Romaja Helper: Registration failed", e);
        vscode.window.showErrorMessage(`Registration Failed: ${e}`);
    }

    // 2. Register Commands
    const convertCommand = vscode.commands.registerCommand(
        "romaja-helper.convertPreviousWord",
        convertPreviousWord
    );

    context.subscriptions.push(convertCommand);
    console.log("Romaja Helper: Registered commands");
}

export function deactivate(): void {}
