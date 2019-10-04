import * as vscode from 'vscode';
import ContentProvider from './ContentProvider';
import { DockerManager } from './dockerManager';
import { basename, join } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn } from 'child_process';
import { rejects } from 'assert';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    let extensionStatusBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 25);

    console.log(`Extension "vscode-onnxvalidate" is now active from path ${context.extensionPath}!!`);

    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    let dockerManager: DockerManager = new DockerManager(context.extensionPath, context);  // constructor gets all the images in the host. This needs to get the

    let initialize = vscode.commands.registerCommand('extension.initializeOnnxEcosystem', async () => {
        extensionStatusBar.text = "Extension initialized!" ;
        extensionStatusBar.show();
    });

    let startDocker = vscode.commands.registerCommand('extension.startOnnxEcosystem', async () => {
        let imageID = await dockerManager.getImageId();
        if (imageID) {
            let containerId = await dockerManager.runImage();
            if (containerId) {
                vscode.window.showInformationMessage("Your development environment is ready");
            }
            else{
                vscode.window.showInformationMessage("Could not run your development environment");
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
        console.log(`Displaying....${basename(modeluri.fsPath)} in Chrome`);
    });

    let quantize = vscode.commands.registerCommand('extension.Quantize', () => {
        console.log("Quantize....");
    });

  

    let DLToolKit = vscode.commands.registerCommand('extension.DLToolKit', (modeluri: vscode.Uri ) => {
        if (modeluri === undefined) {
            vscode.window.showErrorMessage("Requires a file argument!!");
            return;
        }
      
      
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
            let mlperfParam: Map<string, string> = new Map<string, string>(); // delete?
            // refactor this function out.

            let inputNode:string;
            let outputNode:string;
            let opset:string;
            currentPanel.webview.onDidReceiveMessage(async msg => {
                switch (msg.command) {
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
                                    mlperfParam.set("model", value.fsPath);
                                });
                            }
                            if (currentPanel) {
                                currentPanel.webview.postMessage({ command: "modelPath", payload: mlperfParam.get("model") });
                            }
                            vscode.window.showInformationMessage(`Seems like I should be opening ${folderUris}!`);
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
                                    mlperfParam.set("dataset-path", value.fsPath);
                                });
                            }
                            if (currentPanel) {
                                currentPanel.webview.postMessage({ command: "dataSet", payload: mlperfParam.get("dataset-path") });
                            }
                            vscode.window.showInformationMessage(`Seems like I should be opening ${folderUris}!`);
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
                        if (currentPanel !== undefined) {
                            currentPanel.webview.postMessage({ command: 'result', payload: 'IN_PROGRESS' });
                        }
                        await dockerManager.validation(mlperfParam).then(async () => {
                            vscode.window.showInformationMessage("Validation Done");
                            //Read JSON file from stored location here

                            var result_file: string = path.join(os.tmpdir(), "MLPerf", "results.json");
                            console.log(`I got result path: ${result_file}`);

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
                    case "cancel": {
                        mlperfParam.clear();
                        console.log("Canceling verification, cleared mlperfParam");
                        break;
                    }
                    case "setInputNode": {
                        inputNode= msg.text;
                       //debug 
                       //vscode.window.showInformationMessage(`Input Node is ${inputNode}`);
                        break;
                    }
                    case "setOutputNode": {
                        outputNode= msg.text;
                       //debug 
                        // vscode.window.showInformationMessage(`Output Node is ${outputNode}`);
                        break;
                    }
                    case "setOpsetNode": {
                        opset= msg.text;
                       //debug 
                    //    vscode.window.showInformationMessage(`opset is ${opset}`);
                        break;
                    }
                    case "startConversion": {
                        
                        await dockerManager.convert(inputNode, outputNode, opset, modeluri).then(async () => {
                            vscode.window.showInformationMessage("Conversion Done");
                            //Read JSON file from stored location here
                        }, reason => {
                            vscode.window.showInformationMessage(`Conversion failed. ${reason}`);
                           
                        });
                        break;
                    }
                    //fix this 
                    case "cancelConversion": {
                        
                        await dockerManager.convert(inputNode, outputNode, opset,modeluri).then(async () => {
                            vscode.window.showInformationMessage("Conversion Done");
                            //Read JSON file from stored location here
                        }, reason => {
                            vscode.window.showInformationMessage(`Conversion failed. ${reason}`);
                           
                        });
                        break;
                    }



                }

            }, undefined, context.subscriptions);
        }
        currentPanel.webview.html = contentProvider.getProdContent(context);

        vscode.window.showInformationMessage('Panel should be displayed');
        console.log("Validate....");

    });

    let testResultsHandler = () => {
        //const unBundleDiskPath = Uri.file(join(context.extensionPath, "out", "webview", "webview.bundle.js"));

        const testDataPath: string = join(context.extensionPath, 'src', 'test', 'data', 'verification_data.json');
        if (fs.existsSync(testDataPath)) {
            fs.readFile(testDataPath, (err, data) => {
                if (err || data === undefined) {
                    console.log('Error reading data file.');
                } else {
                    let results = JSON.parse(data.toString());
                    try {
                        // Be mindful that the new object created in the lambda *has* to be enclosed in brackets
                        let forGrid : any = Object.entries(results).map(kv => ({ "input" : kv[0],
                                                                                "actual" : (<any>kv[1])["actual"],
                                                                                "expected" : (<any>kv[1])["expected"]
                                                                            }));
                        console.log("Results parsing worked");
                        if (currentPanel !== undefined) {
                            currentPanel.webview.postMessage({ command: 'result', payload: forGrid });
                        }
                    } catch {
                        console.log("Likely pulling from array didn't work.");
                    }
                }
            });
        } else {
            console.log(`Couldn't find: ${testDataPath} on disk.`);
        }

        vscode.window.showInformationMessage("Should be reading results");
    };

    let testPerformanceHandler = () => {
        console.log('In testperformanceHandler');
        const perfDataPath: string = join(context.extensionPath, 'src', 'test', 'data', 'onnxruntime_profile__2019-06-28_04-56-43.json');
        if (fs.existsSync(perfDataPath)) {
            fs.readFile(perfDataPath, (err, data) => {
                if (err || data === undefined) {
                    console.log('Error reading data file.');
                } else {
                    let perfData = JSON.parse(data.toString());
                    try {
                        let forChart : any = Array.from(perfData).filter(rec => { return ((<any>rec)["cat"] === "Node"); })
                                                                 .map(rec => ({ "name" : `${(<any>rec)["name"]/(<any>rec)["args"]["op_name"]}`,
                                                                                "dur" : (<any>rec)["dur"]
                                                                            }));
                        console.log('Should be sending perfdata');
                        if (currentPanel !== undefined) {
                            currentPanel.webview.postMessage({ command: 'perfData', payload: forChart });
                        }
                        vscode.window.showInformationMessage("Apparently parsed the data!");
                    } catch {
                        console.log("Likely couldn't pull the result.");
                    }
                }
            });
        } else {
            console.log(`Couldn't find: ${perfDataPath} on disk.`);
        }

        vscode.window.showInformationMessage("Should be sending perf data for graph");
    };

    let testResults = vscode.commands.registerCommand('firstextension.tryResults', testPerformanceHandler);
    context.subscriptions.push(initialize);
    context.subscriptions.push(startDocker);
  //  context.subscriptions.push(convert);
    context.subscriptions.push(quantize);
    context.subscriptions.push(dockerManager);
    context.subscriptions.push(DLToolKit);
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
