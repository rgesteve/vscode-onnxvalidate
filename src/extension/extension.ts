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
                dlToolkitChannel.appendLine("info", `Successful in running the image. Container id: ${containerId}`)
                vscode.window.showInformationMessage("Your development environment is ready");
            }
            else {
                vscode.window.showInformationMessage("Could not run your development environment");
                dlToolkitChannel.appendLine("error", `Could not run your development environment`)
            }
        }
        else {
            vscode.window.showInformationMessage(`Starting your development environment failed`);
        }
    });

    let display = vscode.commands.registerCommand('extension.Display', (modeluri: vscode.Uri) => {
        const pathToChrome: string = join("c:", "Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe");
        const vizModelPath: string = join(context.extensionPath, 'src', 'test', 'data', 'model.svg');
        // get the file name with which the right click command was executed
        //dockerManager.dockerDisplay(modeluri);
        vscode.window.showInformationMessage(`Display ${basename(modeluri.fsPath)} using ${pathToChrome}...`);
        spawn(pathToChrome, [vizModelPath]); // TODO -- replace this with an in-vscode viewer
        dlToolkitChannel.appendLine("info", `Displaying....${basename(modeluri.fsPath)} in Chrome`);
    });

    let quantize = vscode.commands.registerCommand('extension.Quantize', () => {
        dlToolkitChannel.appendLine("info", "Quantize....");
    });


    context.subscriptions.push(initialize);
    context.subscriptions.push(startDocker);
    context.subscriptions.push(reinitializeEcosystem);
    context.subscriptions.push(quantize);
    context.subscriptions.push(dockerManager);
    context.subscriptions.push(contentProvider);
    context.subscriptions.push(display);
    context.subscriptions.push(vscode.commands.registerCommand('extension.DLToolkit', (modeluri?: vscode.Uri) => contentProvider.showWebview(context.extensionPath)));
}

// this method is called when your extension is deactivated
export function deactivate() { }
