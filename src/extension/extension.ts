import * as vscode from 'vscode';
import ContentProvider from './ContentProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(`Extension "first-extension" is now active from path ${context.extensionPath}!!`);
	const contentProvider = new ContentProvider();
	let currentPanel : vscode.WebviewPanel | undefined = undefined;

	// The command has been declared in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('firstextension.showPanel', () => {

		if (currentPanel) {
			currentPanel.reveal(vscode.ViewColumn.Two);
		} else {
			currentPanel = vscode.window.createWebviewPanel(
				"onnxvalidate",
				"ONNXValidate",
				vscode.ViewColumn.Two,
				{
					enableScripts : true,
					retainContextWhenHidden : true
				}
			);
		}
		currentPanel.webview.html = contentProvider.getProdContent(context);

		// Display a message box to the user
		vscode.window.showInformationMessage('Panel should be displayed');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
