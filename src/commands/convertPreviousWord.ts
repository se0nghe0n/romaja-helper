import * as vscode from "vscode";
import * as koroman from "koroman";

export async function convertPreviousWord(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    const line = document.lineAt(position.line);
    const lineText = line.text;
    const cursorOffset = position.character;

    // Find the word before the cursor
    // Match Korean characters (Hangul) and spaces before cursor
    const hangulRegex = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+/g;
    let match: RegExpExecArray | null;
    let lastMatch: { start: number; end: number; text: string } | null = null;

    // Find all Hangul words before cursor
    while ((match = hangulRegex.exec(lineText)) !== null) {
        if (match.index + match[0].length <= cursorOffset) {
            lastMatch = {
                start: match.index,
                end: match.index + match[0].length,
                text: match[0]
            };
        } else {
            break;
        }
    }

    if (!lastMatch) {
        return;
    }

    try {
        // Convert using koroman
        let romanized = koroman.romanize(lastMatch.text);
        
        // Capitalize first letter
        if (romanized.length > 0) {
            romanized = romanized.charAt(0).toUpperCase() + romanized.slice(1);
        }
        
        // Replace the word
        const startPos = new vscode.Position(position.line, lastMatch.start);
        const endPos = new vscode.Position(position.line, lastMatch.end);
        const range = new vscode.Range(startPos, endPos);

        await editor.edit(editBuilder => {
            editBuilder.replace(range, romanized);
        });

        // Move cursor to end of replaced text
        const newPosition = new vscode.Position(position.line, lastMatch.start + romanized.length);
        editor.selection = new vscode.Selection(newPosition, newPosition);
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Conversion failed: ${errorMessage}`);
    }
}
