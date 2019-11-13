
import { Uri, Disposable, ViewColumn, WebviewPanel, window } from 'vscode';
import { join } from 'path';
import { dlToolkitChannel } from "./dlToolkitChannel";
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { dockerManager } from './dockerManager';

class ContentProvider implements Disposable {
    protected readonly viewType: string = "DL-Toolkit.webview";
    protected currentPanel: WebviewPanel | undefined;
    private listeners: Disposable[] = [];
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
            this.currentPanel.reveal(ViewColumn.Two);
        }
        else {
            this.currentPanel = window.createWebviewPanel(
                "dl toolkit webview",
                "DL Toolkit Webview",
                ViewColumn.One,
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
            command = msg.command.split(":")[0];
            subCommand = msg.command.split(":")[1];
        }
        switch (command) {
            case "setModelPath": {
                window.showOpenDialog({
                    canSelectFolders: false, canSelectFiles: true, canSelectMany: false,
                    openLabel: 'Select model',
                    filters: {
                        'TensorFlow models .pb': ['pb'],
                        'Onnxruntime models .onnx': ['onnx']
                    }
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
                window.showOpenDialog({
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
                window.showOpenDialog({
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
                await dockerManager.validation(this.mlperfParam).then(async () => {
                    window.showInformationMessage("Validation Done");

                    var result_file: string = path.join(os.tmpdir(), "MLPerf", "results.json");
                    dlToolkitChannel.appendLine("info", `MLPerf results: ${result_file}`);

                    if (fs.existsSync(result_file)) {

                        let results = JSON.parse(fs.readFileSync(result_file).toString());
                        if (this.currentPanel !== undefined) {
                            this.currentPanel.webview.postMessage({ command: 'result', payload: `DONE ${JSON.stringify(results)}` });
                        }

                    }
                }, reason => {
                    window.showInformationMessage(`Validation failed. ${reason}`);
                    if (this.currentPanel !== undefined) {
                        this.currentPanel.webview.postMessage({ command: 'result', payload: `FAILED` });
                    }
                });
                break;
            }
            //Need to fix. Add post message to send message to UI to clear input fields.
            case "cancel": {
                this.mlperfParam.clear();
                dlToolkitChannel.appendLine("info", "Canceling verification, cleared mlperfParam");
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

                await dockerManager.convert(this.convertParam).then(async () => {
                    window.showInformationMessage("Conversion Done");
                }, reason => {
                    window.showInformationMessage(`Conversion failed. ${reason}`);

                });
                break;
            }
            //Need to fix. Add post message to send message to UI to clear input fields.

            case "summarizeGraph": {
                let temp: string | undefined = this.convertParam.get("input");
                if (temp) {
                    let summarizeResult = await dockerManager.summarizeGraph(temp).catch(error => dlToolkitChannel.appendLine("error", `summarizeGraph got error ${error}`));
                    if (summarizeResult) {
                        window.showInformationMessage("Summarize Done");
                        dlToolkitChannel.appendLine("info", `Summarize graph result: ${summarizeResult}`);
                        if (this.currentPanel !== undefined) {
                            this.currentPanel.webview.postMessage({ command: 'summarizeResult', payload: summarizeResult });
                        }
                    }
                    else {
                        window.showInformationMessage("Summarize failed");
                        dlToolkitChannel.appendLine("error", `Summarize failed`);
                    }
                }

                break;
            }
            case "cancelConversion": {
                break;
            }

            case "startQuantization": {

                await dockerManager.quantizeModel(this.quantizeParam).then(async () => {
                    window.showInformationMessage("Quantization Done");
                }, reason => {
                    window.showInformationMessage(`Quantization failed. ${reason}`);
                    dlToolkitChannel.appendLine("error", `Quantization failed. ${reason}`);

                });
                break;
            }
            case "setFunctionName": {
                this.quantizeParam.set("data_preprocess", msg.text);
                break;
            }
            case "downloadResult": {
                window.showSaveDialog({ filters: { '*': ['txt'] } }).then(uri => {
                    if (!uri) {
                        window.showErrorMessage(
                            'You must select a file location to save the results!'
                        );
                        dlToolkitChannel.appendLine("error", "Didnt select a file location!");
                        return;
                    }
                    const fs = require('fs');
                    fs.copyFile(path.join(os.tmpdir(), "MLPerf", "results.json"), uri.fsPath, (err: any) => {
                        if (err) {
                            dlToolkitChannel.appendLine("error", "Errored out while writing the file");
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
        const unBundleDiskPath = Uri.file(join(extension, "out", "webview", "webview.bundle.js"));
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