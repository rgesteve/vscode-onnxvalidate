'use strict';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import ContentProvider from './ContentProvider';
// this class manages the docker commands like build, run, exec, 
export class DockerManager {
    private _imageIds: string[]; // declare an array of image ids, that exists on the system, conversionContainerImage, QuantizationImage
    private _containerIds: string[];
    private _workspace: vscode.WorkspaceFolder | undefined;
    private _extensionPath: string;
    private _context: vscode.ExtensionContext | undefined;
    // the constructor might need to get the required images from the docker hub too.
    constructor(extensionPath: string, context: vscode.ExtensionContext) {
        this._imageIds = [];
        this._containerIds = [];
        this._extensionPath = extensionPath;
        this._context = context;
        let currentContainerId: string = "";

        if (vscode.window.activeTextEditor)
            this._workspace = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri);
        let images = cp.spawn('docker', ['images', 'onnx-ecosystem:latest']);

        let allImages: string = "";
        images.stdout.on("data", (data: string): void => {
            allImages = allImages + data.toString();
        });
        images.on("exit", (data: string | Buffer): void => {

            console.log(`Testing... ${allImages}`);
            this._imageIds.push(allImages.trim().split(/\s+ \s+/)[4].split('\n')[1]);

            if (vscode.window.activeTextEditor) {
                if (this._workspace && vscode.workspace.workspaceFolders) {
                    let userWorkspaceMount: string = `source=${this._workspace.uri.fsPath},target=C:\\${path.basename(this._workspace.uri.fsPath)},type=bind`;
                    let extensionMount: string = `source=${os.tmpdir()},target=C:\\output,type=bind`;
                    console.log(`mount location:${userWorkspaceMount}`);
                    console.log(`${this._imageIds[0]}`);

                    let runningContainer = cp.spawn('docker', ['run', '-t', '-d', '--mount', userWorkspaceMount, '--mount', extensionMount, this._imageIds[0]]);

                    console.log(this._workspace.uri.fsPath);
                    runningContainer.on('error', (err) => {
                        console.log('Failed to start the container.');
                    });

                    runningContainer.stdout.on('data', (data: string) => {
                        console.log(`Creating container id ${data.toString()}`);
                        currentContainerId = data.toString();
                    });

                    runningContainer.on('exit', (err) => {
                        if (err != 0) {
                            vscode.window.showInformationMessage("Something wrong happening while starting the development environment is ready");
                            console.log(`Exit with error code:  ${err}`);
                        }
                        else {
                            this._containerIds.push(currentContainerId.substr(0, 12));
                            vscode.window.showInformationMessage("Development environment is ready!");
                            console.log("Development environment successfully running!");
                        }

                    });
                }
            }

        });
    }

    // Docker exec needs a running container, 
    dockerExec(fileuri: any) {
        console.log("here");
        if (this._workspace && vscode.workspace.workspaceFolders) {
            console.log(`Location: C:\\${path.basename(this._workspace.uri.fsPath)}\\tf_onnx.py C:\\${path.basename(this._workspace.uri.fsPath)}\\${path.basename(fileuri.fsPath)}`);
            let exec = cp.spawn('docker', ['exec', this._containerIds[0], 'python', `C:\\${path.basename(this._workspace.uri.fsPath)}\\tf_onnx.py`, `C:\\${path.basename(this._workspace.uri.fsPath)}\\${path.basename(fileuri.fsPath)}`]);

            console.log("Converting...");
            exec.on('error', (err) => {
                console.log('Failed to start the container.');
            });

            exec.stdout.on('data', (data: string) => {
                console.log(`container id is ${data.toString()}`);
                this._containerIds.push(data.toString().substr(0, 12));
            });

            exec.on('exit', (err: any) => {
                if (err != 0) {
                    vscode.window.showInformationMessage("Conversion failed");
                    console.log(`Exit with error code:  ${err}`);
                }
                else {
                    vscode.window.showInformationMessage("Converted to an ONNX model!");
                    console.log("Converted to an onnx model!");
                }

            });
        }
    }

    dockerValidate() {

    }
    dockerRunValidation(inputPath: string, referenceOutputPath: string, currentPanel: vscode.WebviewPanel | undefined) {

        if (this._workspace) {
            let temp = this._workspace.uri.fsPath + "\\";
            let containerInputPath = `C:\\${path.basename(this._workspace.uri.fsPath)}\\${inputPath.replace(temp, "")}`;
            let containerRefPath = `C:\\${path.basename(this._workspace.uri.fsPath)}\\${referenceOutputPath.replace(temp, "")}`;
            let exec = cp.spawn('docker', ['exec', '-w', "C:\\scratch\\mnist\\test", this._containerIds[0], 'python', `C:\\scratch\\mnist\\test\\mnist_validate.py`, containerInputPath, containerRefPath]);
            console.log(containerInputPath);
            console.log(containerRefPath);

            exec.on('error', (err) => {
                console.log('Running validation failed.');
            });
            exec.stdout.on('data', (data: string) => {
                console.log("Running validation...");

            });
            exec.on('exit', (err: any) => {
                if (err != 0) {
                    vscode.window.showInformationMessage("Running validation failed");
                    console.log(`Exit with error code:  ${err}`);
                }
                else {
                    vscode.window.showInformationMessage("Validation done!");
                    console.log("Validation done!");
                    let datajson = fs.readFileSync(path.join(os.tmpdir(), "result.json"), "utf8");

                    if (currentPanel) {
                        currentPanel.webview.postMessage({ command: "result", payload: datajson });
                    }
                    console.log(`Result: \n ${datajson}`)
                }
            });
        }
    }
    dispose(): void {

    }
}
