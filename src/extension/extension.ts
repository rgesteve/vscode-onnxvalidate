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

	let disposable = vscode.commands.registerCommand('firstextension.showPanel', () => {

		if (currentPanel) {
			currentPanel.reveal(vscode.ViewColumn.Two);
		} else {
			currentPanel = vscode.window.createWebviewPanel(
				"onnxvalidate",
				"ONNXValidate",
				vscode.ViewColumn.One,
				{
					enableScripts : true,
					retainContextWhenHidden : true
				}
			);
			currentPanel.webview.onDidReceiveMessage(msg => {
				let txtMessage = "generic command";
				if (msg.command === 'setInputFile') {
					vscode.window.showOpenDialog({
						openLabel : 'Select file containing input file'
					}).then( (uri) => {
						vscode.window.showInformationMessage(`Seems like I should be opening ${uri}!`);
					});
					txtMessage = "should be asking for opening a file";
				}
				vscode.window.showInformationMessage(`Seems like I got a message ${txtMessage}!`);
			}, undefined, context.subscriptions);
		}
		currentPanel.webview.html = contentProvider.getProdContent(context);

		// Display a message box to the user
		vscode.window.showInformationMessage('Panel should be displayed');
	});

	context.subscriptions.push(disposable);

	context.subscriptions.push(vscode.commands.registerCommand('firstextension.addCountToPanel', () => {
		if (currentPanel !== undefined) {
			currentPanel.webview.postMessage({ command: 'testCommand', payload: 'just some data'});
		}
		vscode.window.showInformationMessage("Just sent message to view, check console");
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
