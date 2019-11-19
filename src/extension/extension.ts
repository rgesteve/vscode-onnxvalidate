import * as vscode from 'vscode';
import { contentProvider } from './contentProvider';
import { dockerManager } from './dockerManager';
import { basename, join } from 'path';
import { spawn } from 'child_process';
import { dlToolkitChannel } from "./dlToolkitChannel";

export async function activate(context: vscode.ExtensionContext): Promise<void> {

    let extensionStatusBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 25);

    dlToolkitChannel.appendLine("info", `Extension "dl-toolkit" is now active from path ${context.extensionPath}!!`);

    let initialize = vscode.commands.registerCommand('extension.initializeOnnxEcosystem', () => {
        extensionStatusBar.text = "Extension initialized!";
        extensionStatusBar.show();
    });


    let reinitializeEcosystem = vscode.commands.registerCommand('extension.reinitializeEcosystem', async () => {
        let containerType = await dockerManager.getContainerType().catch(error => dlToolkitChannel.appendLine("error", `getContainerType: ${error}`));

        if (containerType) {
            dlToolkitChannel.appendLine("info", "Reinitialization successful!");
            vscode.window.showInformationMessage("Reinitialization successful!");
        }
        else {
            dlToolkitChannel.appendLine("error", "Reinitialization failed!");
            vscode.window.showInformationMessage("Reinitialization failed!");
        }
    });

    let startDocker = vscode.commands.registerCommand('extension.startOnnxEcosystem', async () => {
        let imageID = await dockerManager.getImageId().catch(error => dlToolkitChannel.appendLine("error", `getImageId: ${error}`));
        if (imageID) {
            let containerId = await dockerManager.runImage().catch(error => dlToolkitChannel.appendLine("error", `runImage: ${error}`));;
            if (containerId) {
                dlToolkitChannel.appendLine("info", `Successful in running the image. Container id: ${containerId}`);
                vscode.window.showInformationMessage("Your development environment is ready");
            }
            else {
                dlToolkitChannel.appendLine("error", `Could not run your development environment`);
                vscode.window.showInformationMessage("Could not run your development environment");
            }
        }
        else {
            dlToolkitChannel.appendLine("error", `Starting your development environment failed`);
            vscode.window.showInformationMessage(`Starting your development environment failed`);
        }
    });



    context.subscriptions.push(initialize);
    context.subscriptions.push(startDocker);
    context.subscriptions.push(reinitializeEcosystem);
    context.subscriptions.push(dockerManager);
    context.subscriptions.push(contentProvider);
    context.subscriptions.push(vscode.commands.registerCommand('extension.DLToolkit', (modeluri?: vscode.Uri) => contentProvider.showWebview(context.extensionPath)));
}

// this method is called when your extension is deactivated
export function deactivate() { }
