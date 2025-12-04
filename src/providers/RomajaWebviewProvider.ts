import * as vscode from "vscode";
import * as fs from "fs";

export class RomajaWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "romaja-helper.input";

    constructor(private readonly _context: vscode.ExtensionContext) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._context.extensionUri],
        };

        try {
            webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        } catch (e) {
            console.error("Romaja Helper: Failed to load HTML", e);
            webviewView.webview.html = `<h3>Error: ${e}</h3>`;
        }

        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === "convert") {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    editor.edit(editBuilder => {
                        editBuilder.insert(editor.selection.active, message.romanized);
                    });
                }
            } else if (message.command === "error") {
                vscode.window.showErrorMessage(message.text);
            }
        });
    }

    private _getHtmlForWebview(_webview: vscode.Webview): string {
        // Use extensionUri to properly resolve the HTML file path
        // The HTML file is in the media folder which is included in the package
        const htmlUri = vscode.Uri.joinPath(this._context.extensionUri, "media", "webview.html");
        const htmlPath = htmlUri.fsPath;
        
        if (!fs.existsSync(htmlPath)) {
            throw new Error(`HTML file not found at ${htmlPath}`);
        }

        return fs.readFileSync(htmlPath, "utf-8");
    }
}
