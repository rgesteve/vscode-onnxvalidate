
import * as vscode from 'vscode';
import { join } from 'path';
import { dlToolkitChannel } from "./dlToolkitChannel";
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { dockerManager } from './dockerManager';

class ContentProvider implements vscode.Disposable {
    protected readonly viewType: string = "DL-Toolkit.webview";
    protected currentPanel: vscode.WebviewPanel | undefined;
    private listeners: vscode.Disposable[] = [];
    private mlperfParam: Map<string, string> = new Map<string, string>();
    private convertParam: Map<string, string> = new Map<string, string>();
    private quantizeParam: Map<string, string> = new Map<string, string>();

    public dispose(): void {
        if (this.currentPanel) {
            this.currentPanel.dispose();
        }
    }

    public showWebview(extensionPath: string): void {
        if (this.currentPanel) {
            this.currentPanel.reveal(vscode.ViewColumn.Two);
        }
        else {
            this.currentPanel = vscode.window.createWebviewPanel(
                "dl toolkit webview",
                "DL Toolkit Webview",
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            this.currentPanel.webview.onDidReceiveMessage(this.onDidReceiveMessage, this, this.listeners);
            this.currentPanel.onDidDispose(this.onDidDisposeWebview, this, this.listeners);
            this.currentPanel.webview.html = this.getProdContent(extensionPath);
        }
    }

    protected async onDidReceiveMessage(msg: any): Promise<void> {

        let command: string = msg.command;
        let subCommand: string = "";
        if (msg.command.includes(":")) {
            [command, subCommand]  = msg.command.split(":");
        }
        switch (command) {
            case "setModelPath": {
                vscode.window.showOpenDialog({
                    canSelectFiles: true, canSelectFolders: false, canSelectMany: false,
                    openLabel: 'Select model',
                }).then((folderUris) => {
                    if (folderUris) {
                        folderUris.forEach(value => {

                            switch (subCommand) {
                                case "convert": {
                                    this.convertParam.set("input", value.fsPath);
                                    if (this.currentPanel) {
                                        this.currentPanel.webview.postMessage({ command: "modelPathConvert", payload: this.convertParam.get("input") });
                                    }
                                    break;
                                }
                                case "quantize": {
                                    this.quantizeParam.set("model_path", value.fsPath);
                                    if (this.currentPanel) {
                                        this.currentPanel.webview.postMessage({ command: "modelPathQuantize", payload: value.fsPath });
                                    }
                                    break;
                                }
                                case "validate": {
                                    this.mlperfParam.set("model", value.fsPath);
                                    if (this.currentPanel) {
                                        this.currentPanel.webview.postMessage({ command: "modelPathValidate", payload: this.mlperfParam.get("model") });
                                    }
                                    break;
                                }
                            }

                        });
                    }
                });
                break;
            }
            case "setDataset": {
                vscode.window.showOpenDialog({
                    canSelectFolders: true, canSelectFiles: false, canSelectMany: false,
                    openLabel: 'Select dataset'
                }).then((folderUris) => {
                    if (folderUris) {
                        folderUris.forEach(value => {
                            switch (subCommand) {
                                case "quantize": {
                                    this.quantizeParam.set("dataset_path", value.fsPath);
                                    if (this.currentPanel) {
                                        this.currentPanel.webview.postMessage({ command: "datasetQuantize", payload: value.fsPath });
                                    }
                                    break;
                                }
                                case "validate": {
                                    this.mlperfParam.set("dataset-path", value.fsPath);
                                    if (this.currentPanel) {
                                        this.currentPanel.webview.postMessage({ command: "datasetValidate", payload: this.mlperfParam.get("dataset-path") });
                                    }
                                    break;
                                }
                            }
                            this.mlperfParam.set("dataset-path", value.fsPath);
                        });
                    }
                });
                break;
            }

            case "setPreprocessModulePath": {
                vscode.window.showOpenDialog({
                    canSelectFolders: true, canSelectFiles: false, canSelectMany: false,
                    openLabel: 'Select module path'
                }).then((folderUris) => {
                    if (folderUris) {
                        folderUris.forEach(value => {
                            this.quantizeParam.set("data_preprocess_filepath", value.fsPath);
                            if (this.currentPanel) {
                                this.currentPanel.webview.postMessage({ command: "preprocessModulePath", payload: value.fsPath });
                            }
                        });
                    }
                });
                break;
            }
            case "setProfileOption": {
                this.mlperfParam.set("profile", msg.text);
                break;
            }
            case "setBackend": {
                this.mlperfParam.set("backend", msg.text);
                break;
            }

            case "setDataFormat": {
                this.mlperfParam.set("data-format", msg.text);
                break;
            }
            case "setnumberOfImages": {
                this.mlperfParam.set("count", msg.text);
                break;
            }

            case "startVerification": {
                let test = await dockerManager.validation(this.mlperfParam).then(async () => {
                    vscode.window.showInformationMessage("Validation done");
                    dlToolkitChannel.appendLine("info", "Validation done");

                    var result_file: string = path.join(os.tmpdir(), "MLPerf", "results.json");
                    dlToolkitChannel.appendLine("info", `MLPerf results: ${result_file}`);

                    if (fs.existsSync(result_file)) {

                        let results = JSON.parse(fs.readFileSync(result_file).toString());
                        if (this.currentPanel !== undefined) {
                            this.currentPanel.webview.postMessage({ command: 'result', payload: `DONE ${JSON.stringify(results)}` });
                        }

                    }
                }, reason => {
                    vscode.window.showInformationMessage(`Validation failed`);
                    dlToolkitChannel.appendLine("error", `Validation failed. Error: ${reason}`);
                    if (this.currentPanel !== undefined) {
                        this.currentPanel.webview.postMessage({ command: 'result', payload: `FAILED` });
                    }
                });
                break;
            }

            case "cancelValidation": {
                this.mlperfParam.clear();
                dlToolkitChannel.appendLine("info", "Canceling validation, cleared mlperfParam");
                if (this.currentPanel !== undefined) {
                    this.currentPanel.webview.postMessage({ command: 'clearValidationForm' });
                }
                break;
            }

            case "cancelConversion": {
                this.convertParam.clear();
                dlToolkitChannel.appendLine("info", "Canceling conversion, cleared convertParam");
                if (this.currentPanel !== undefined) {
                    this.currentPanel.webview.postMessage({ command: 'clearConversionForm' });
                }
                break;
            }

            case "cancelQuantization": {
                this.quantizeParam.clear();
                dlToolkitChannel.appendLine("info", "Canceling quantization, cleared quantizeParam");
                if (this.currentPanel !== undefined) {
                    this.currentPanel.webview.postMessage({ command: 'clearQuantizationForm' });
                }
                break;
            }
            case "setModel": {
                this.convertParam.set("input", msg.text);
                break;
            }
            case "setInputNode": {
                this.convertParam.set("inputs", msg.text);
                break;
            }
            case "setOutputNode": {
                this.convertParam.set("outputs", msg.text);
                break;
            }
            case "setOpsetNode": {
                this.convertParam.set("opset", msg.text);
                break;
            }
            case "startConversion": {
                try {
                    let test = await dockerManager.convert(this.convertParam);
                    vscode.window.showInformationMessage("Conversion done");
                    dlToolkitChannel.appendLine("info", "Conversion done");
                } catch (e) {
                    vscode.window.showInformationMessage("Conversion failed");
                    dlToolkitChannel.appendLine("error", `Conversion failed. Error: ${e}`);
                }
                break;
            }

            case "summarizeGraph": {
                let temp: string | undefined = this.convertParam.get("input");
                if (temp) {
                    try {
                        let summarizeResult = await dockerManager.summarizeGraph(temp);
                        if (summarizeResult) {
                            vscode.window.showInformationMessage("Summarize done");
                            dlToolkitChannel.appendLine("info", `Summarize graph result: ${summarizeResult}`);
                            if (this.currentPanel !== undefined) {
                                this.currentPanel.webview.postMessage({ command: 'summarizeResult', payload: summarizeResult });
                            }
                        }
                        else {
                            dlToolkitChannel.appendLine("error", `Summarize returned empty string`);
                        }
                    }
                    catch (e) {
                        vscode.window.showInformationMessage("Summarize graph failed");
                        dlToolkitChannel.appendLine("error", `Summarize graph failed. Error: ${e}`);
                    }

                }

                break;
            }

            case "startQuantization": {

                let test = await dockerManager.quantizeModel(this.quantizeParam).then(async () => {
                    vscode.window.showInformationMessage("Quantization Done");
                }, reason => {
                    vscode.window.showInformationMessage(`Quantization failed. ${reason}`);
                    dlToolkitChannel.appendLine("error", `Quantization failed. ${reason}`);

                });
                break;
            }
            case "setFunctionName": {
                this.quantizeParam.set("data_preprocess", msg.text);
                break;
            }
            case "downloadResult": {
                vscode.window.showSaveDialog({ filters: { '*': ['txt'] } }).then(uri => {
                    if (!uri) {
                        vscode.window.showErrorMessage(
                            'You must select a file location to save the results'
                        );
                        dlToolkitChannel.appendLine("error", "Did not select a file location");
                        return;
                    }
                    const fs = require('fs');
                    fs.copyFile(path.join(os.tmpdir(), "MLPerf", "results.json"), uri.fsPath, (err: any) => {
                        if (err) {
                            dlToolkitChannel.appendLine("error", "Error while writing the file");
                            throw err;
                        }

                        dlToolkitChannel.appendLine("info", `${path.join(os.tmpdir(), "MLPerf", "results.json")} was copied to ${uri.fsPath}`);
                    });
                });
                break;
            }


        }

    }

    protected onDidDisposeWebview(): void {
        this.currentPanel = undefined;
        for (const listener of this.listeners) {
            listener.dispose();
        }
        this.listeners = [];
    }

    getProdContent(extension: string) {
        const unBundleDiskPath = vscode.Uri.file(join(extension, "out", "webview", "webview.bundle.js"));
        const unBundlePath = unBundleDiskPath.with({ scheme: 'vscode-resource' });
        return `
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Model validation comparison</title>
          </head>
          <body>
            <div id="root"></div>
            <script src="${unBundlePath}" type="text/javascript"></script>
          </body>
        </html>
        `;
    }
}

export const contentProvider: ContentProvider = new ContentProvider();