import * as vscode from 'vscode';
import ContentProvider from './ContentProvider';
import { DockerManager } from './dockerManager';
import { basename, join } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn } from 'child_process';
import { dlToolkitChannel} from "./dlToolkitChannel";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    let extensionStatusBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 25);

    dlToolkitChannel.appendLine("info", `Extension "dl-toolkit" is now active from path ${context.extensionPath}!!`);

    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    let dockerManager: DockerManager = new DockerManager(context.extensionPath, context);  // constructor gets all the images in the host. This needs to get the

    let initialize = vscode.commands.registerCommand('extension.initializeOnnxEcosystem', async () => {
        extensionStatusBar.text = "Extension initialized!" ;
        extensionStatusBar.show();
    });


    let reinitializeEcosystem = vscode.commands.registerCommand('extension.reinitializeEcosystem', async () => {
        let containerType = await dockerManager.getContainerType();
        if (containerType){
            dlToolkitChannel.appendLine("info", "Reinitialization successful!");
            vscode.window.showInformationMessage("Reinitialization successful!");
        }
        else {
            dlToolkitChannel.appendLine("error", "Reinitialization failed!");
            vscode.window.showInformationMessage("Reinitialization failed!");
        }
    });

    let startDocker = vscode.commands.registerCommand('extension.startOnnxEcosystem', async () => {
        let imageID = await dockerManager.getImageId();
        if (imageID) {
            let containerId = await dockerManager.runImage();
            if (containerId) {
                dlToolkitChannel.appendLine("info", `Successful in running the image. Container id: ${containerId}`)
                vscode.window.showInformationMessage("Your development environment is ready");
            }
            else{
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

  

    let DLToolkit = vscode.commands.registerCommand('extension.DLToolkit', (modeluri?: vscode.Uri ) => {   
        const contentProvider = new ContentProvider();

        if (currentPanel) {
            currentPanel.reveal(vscode.ViewColumn.Two);
        }
        else {
            currentPanel = vscode.window.createWebviewPanel(
                "dl toolkit webview",
                "DL Toolkit Webview",
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );
            let mlperfParam: Map<string, string> = new Map<string, string>(); 
            let convertParam: Map<string, string> = new Map<string, string>();
            let quantizeParam: Map<string, string> = new Map<string, string>();
            // refactor this function out.

            let inputNode:string;
            let outputNode:string;
            let opset:string;
            currentPanel.webview.onDidReceiveMessage(async msg => {
                let command : string = msg.command;
                let subCommand : string = "";
                if (msg.command.includes(":"))
                {
                    command = msg.command.split(":")[0];
                    subCommand = msg.command.split(":")[1];
                }
                switch (command) {
                    case "setModelPath": {
                        vscode.window.showOpenDialog({
                            //modified this as you can select either file or folder not both, set selecting only files as folders wont be helpful here
                            canSelectFolders: false, canSelectFiles: true, canSelectMany: false,
                            openLabel: 'Select model',
                            //added this for an example - searches for .tf, .pb,.onnx format - can change this back to default
                            filters:{
                               'TensorFlow models .pb' : ['pb'],
                               'Onnxruntime models .onnx': ['onnx']
                            }
                        }).then((folderUris) => {
                            if (folderUris) {
                                folderUris.forEach(function (value) {
                                    
                                    switch(subCommand) {
                                        case "convert" : {
                                            convertParam.set("input", value.fsPath);
                                            if (currentPanel) {
                                                currentPanel.webview.postMessage({ command: "modelPathConvert", payload: convertParam.get("input") });
                                            }
                                            break;
                                        }
                                        case "quantize" : {
                                            quantizeParam.set("model", value.fsPath);
                                            if (currentPanel) {
                                                currentPanel.webview.postMessage({ command: "modelPathQuantize", payload: value.fsPath });
                                            }
                                            break;
                                        }
                                        case "validate" : {
                                            mlperfParam.set("model", value.fsPath);
                                            if (currentPanel) {
                                                currentPanel.webview.postMessage({ command: "modelPathValidate", payload: mlperfParam.get("model") });
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
                            canSelectFolders: true, canSelectFiles: true, canSelectMany: false,
                            openLabel: 'Select dataset'
                        }).then((folderUris) => {
                            if (folderUris) {
                                folderUris.forEach(function (value) {
                                    switch(subCommand) {
                                        case "quantize" : {
                                            quantizeParam.set("dataset", value.fsPath);
                                            if (currentPanel) {
                                                currentPanel.webview.postMessage({ command: "datasetQuantize", payload: value.fsPath });
                                            }
                                            break;
                                        }
                                        case "validate" : {
                                            mlperfParam.set("dataset-path", value.fsPath);
                                            if (currentPanel) {
                                                currentPanel.webview.postMessage({ command: "datasetValidate", payload: mlperfParam.get("dataset-path") });
                                            }
                                            break;
                                        }
                                    }
                                    mlperfParam.set("dataset-path", value.fsPath);
                                });
                            }
                        });
                        break;
                    }
                    case "setProfileOption": {
                        mlperfParam.set("profile", msg.text);
                        break;
                    }
                    case "setBackend": {
                        mlperfParam.set("backend", msg.text);
                        break;
                    }

                    case "setDataFormat": {
                        mlperfParam.set("data-format", msg.text);
                        break;
                    }
                    case "setnumberOfImages": {
                        mlperfParam.set("count", msg.text);
                        break;
                    }

                    case "startVerification": {
                        await dockerManager.validation(mlperfParam).then(async () => {
                            vscode.window.showInformationMessage("Validation Done");
                            //Read JSON file from stored location here

                            var result_file: string = path.join(os.tmpdir(), "MLPerf", "results.json");
                            dlToolkitChannel.appendLine("info", `MLPerf results: ${result_file}`);

                            if(fs.existsSync(result_file)) {

                                let results = JSON.parse(fs.readFileSync(result_file).toString());
                                if (currentPanel !== undefined) {
                                    currentPanel.webview.postMessage({ command: 'result', payload: `DONE ${JSON.stringify(results)}` });
                                }

                            }
                        }, reason => {
                            vscode.window.showInformationMessage(`Validation failed. ${reason}`);
                            if (currentPanel !== undefined) {
                                currentPanel.webview.postMessage({ command: 'result', payload: `FAILED` });
                            }
                        });
                        break;
                    }
                       //Need to fix. Add post message to send message to UI to clear input fields.
                    case "cancel": {
                        mlperfParam.clear();
                        dlToolkitChannel.appendLine("info", "Canceling verification, cleared mlperfParam");
                        break;
                    }
                    case "setModel": {
                        convertParam.set("input", msg.text);
                        break;
                    }
                    case "setInputNode": {
                        convertParam.set("inputs", msg.text);
                        break;
                    }
                    case "setOutputNode": {
                        convertParam.set("outputs", msg.text);
                        break;
                    }
                    case "setOpsetNode": {
                        convertParam.set("opset", msg.text);
                        break;
                    }
                    case "startConversion": {
                        
                        await dockerManager.convert(convertParam).then(async () => {
                            vscode.window.showInformationMessage("Conversion Done");
                            //Read JSON file from stored location here
                        }, reason => {
                            vscode.window.showInformationMessage(`Conversion failed. ${reason}`);
                           
                        });
                        break;
                    }
                    //Need to fix. Add post message to send message to UI to clear input fields.

                    case "summarizeGraph": {
                        let temp : string | undefined = convertParam.get("input");
                        if (temp) {
                            let summarizeResult: string | undefined = await dockerManager.summarizeGraph(temp);
                            if (summarizeResult) {
                                vscode.window.showInformationMessage("Summarize Done");
                                dlToolkitChannel.appendLine("info", `Summarize graph result: ${summarizeResult}`);
                                if (currentPanel !== undefined) {
                                    currentPanel.webview.postMessage({ command: 'summarizeResult', payload: summarizeResult });
                                }
                            }
                            else {
                                vscode.window.showInformationMessage("Summarize failed");
                                dlToolkitChannel.appendLine("error", `Summarize failed`);
                            }
                        }

                        break;
                    }
                    case "cancelConversion": {
                        
                        inputNode=""
                        outputNode=""
                        opset=""
                        break;
                    }

                    case "startQuantization": {
                        
                        await dockerManager.quantizeModel(quantizeParam).then(async () => {
                            vscode.window.showInformationMessage("Quantization Done");
                        }, reason => {
                            vscode.window.showInformationMessage(`Quantization failed. ${reason}`);
                            dlToolkitChannel.appendLine("error", `Quantization failed. ${reason}`);
                           
                        });
                        break;
                    }

                    case "downloadResult" : {
                        vscode.window.showSaveDialog({ filters: { '*': ['txt'] } }).then(uri => {
                            if (!uri) {
                                vscode.window.showErrorMessage(
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

            }, undefined, context.subscriptions);
        }
        currentPanel.webview.html = contentProvider.getProdContent(context);
        dlToolkitChannel.appendLine("info", "Panel should be displayed...");

    });

    let testResultsHandler = () => {
        //const unBundleDiskPath = Uri.file(join(context.extensionPath, "out", "webview", "webview.bundle.js"));

        const testDataPath: string = join(context.extensionPath, 'src', 'test', 'data', 'verification_data.json');
        if (fs.existsSync(testDataPath)) {
            fs.readFile(testDataPath, (err, data) => {
                if (err || data === undefined) {
                    dlToolkitChannel.appendLine("info", 'Error reading data file.');
                } else {
                    let results = JSON.parse(data.toString());
                    try {
                        // Be mindful that the new object created in the lambda *has* to be enclosed in brackets
                        let forGrid : any = Object.entries(results).map(kv => ({ "input" : kv[0],
                                                                                "actual" : (<any>kv[1])["actual"],
                                                                                "expected" : (<any>kv[1])["expected"]
                                                                            }));
                        dlToolkitChannel.appendLine("info", "Results parsing worked");
                        if (currentPanel !== undefined) {
                            currentPanel.webview.postMessage({ command: 'result', payload: forGrid });
                        }
                    } catch {
                        dlToolkitChannel.appendLine("error","Likely pulling from array didn't work.");
                    }
                }
            });
        } else {
            dlToolkitChannel.appendLine("error", `Couldn't find: ${testDataPath} on disk.`);
        }

        vscode.window.showInformationMessage("Should be reading results");
    };

    let testPerformanceHandler = () => {
        dlToolkitChannel.appendLine("info", 'In testperformanceHandler');
        const perfDataPath: string = join(context.extensionPath, 'src', 'test', 'data', 'onnxruntime_profile__2019-06-28_04-56-43.json');
        if (fs.existsSync(perfDataPath)) {
            fs.readFile(perfDataPath, (err, data) => {
                if (err || data === undefined) {
                    dlToolkitChannel.appendLine("error", 'Error reading data file.');
                } else {
                    let perfData = JSON.parse(data.toString());
                    try {
                        let forChart : any = Array.from(perfData).filter(rec => { return ((<any>rec)["cat"] === "Node"); })
                                                                 .map(rec => ({ "name" : `${(<any>rec)["name"]/(<any>rec)["args"]["op_name"]}`,
                                                                                "dur" : (<any>rec)["dur"]
                                                                            }));
                        dlToolkitChannel.appendLine("info", 'Should be sending perfdata');
                        if (currentPanel !== undefined) {
                            currentPanel.webview.postMessage({ command: 'perfData', payload: forChart });
                        }
                        vscode.window.showInformationMessage("Apparently parsed the data!");
                    } catch {
                        dlToolkitChannel.appendLine("error", "Likely couldn't pull the result.");
                    }
                }
            });
        } else {
            dlToolkitChannel.appendLine("error", `Couldn't find: ${perfDataPath} on disk.`);
        }

        vscode.window.showInformationMessage("Should be sending perf data for graph");
    };

    let testResults = vscode.commands.registerCommand('firstextension.tryResults', testPerformanceHandler);
    context.subscriptions.push(initialize);
    context.subscriptions.push(startDocker);
    context.subscriptions.push(reinitializeEcosystem);
    context.subscriptions.push(quantize);
    context.subscriptions.push(dockerManager);
    context.subscriptions.push(DLToolkit);
    context.subscriptions.push(testResults);

    context.subscriptions.push(vscode.commands.registerCommand('firstextension.addCountToPanel', () => {
        if (currentPanel !== undefined) {
            currentPanel.webview.postMessage({ command: 'testCommand', payload: 'just some data' });
        }
        vscode.window.showInformationMessage("Just sent message to view, check console");
    }));
}

// this method is called when your extension is deactivated
export function deactivate() { }
