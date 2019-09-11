'use strict';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import ContentProvider from './ContentProvider';
import { isWindows, getMLPerfLocation, getMLPerfDriver } from './osUtils';
import { supported_models } from './config';

// this class manages the docker commands like build, run, exec, 

// let supported_models : { [key: string]: {inputs: string, outputs: string}} = {
//     // resnet
//     "resnet50": {
//         "inputs": "input_tensor:0",
//         "outputs" : "ArgMax:0",
//     },
//     // mobilenet
//     "mobilenet": {
//         "inputs": "input:0",
//         "outputs": "MobilenetV1/Predictions/Reshape_1:0",
//     },
// }

//let mlperfLocation: string = "C:\\inference\\v0.5\\classification_and_detection"
//let mlperfDriver: string = "python\\main.py";

export class DockerManager {
    private _imageIds: string[]; // declare an array of image ids, that exists on the system, conversionContainerImage, QuantizationImage
    private _containerIds: string[];
    private _workspace: vscode.WorkspaceFolder | undefined;
    private _extensionPath: string;
    private _context: vscode.ExtensionContext | undefined;
    private _usermountlocation: string = "";
    // the constructor might need to get the required images from the docker hub too.
    constructor(extensionPath: string, context: vscode.ExtensionContext) {
        this._imageIds = [];
        this._containerIds = [];
        this._extensionPath = extensionPath;
        this._context = context;
        let currentContainerId: string = "";
        //TODO: Make sure that the host system has docker and this image.
        // if not, get it from docker hub? that part needs to be decided.
        const workspaceFolders: vscode.WorkspaceFolder[] = vscode.workspace.workspaceFolders || [];
        if (workspaceFolders.length !=0 ) {
            
        }
        if (vscode.window.activeTextEditor)
            this._workspace = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri);
        let images = cp.spawn('docker', ['images', 'onnx-ecosystem-mlperf:latest']);

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
                     this._usermountlocation = `C:\\${path.basename(this._workspace.uri.fsPath)}`;

                    }
                    // let runningContainer = cp.spawn('docker', ['run', '-m', '8g','-t', '-d', '--mount', userWorkspaceMount, '--mount', extensionMount, this._imageIds[0]]);

                    // console.log(this._workspace.uri.fsPath);
                    // runningContainer.on('error', (err) => {
                    //     console.log('Failed to start the container.');
                    // });

                    // runningContainer.stdout.on('data', (data: string) => {
                    //     console.log(`Creating container id ${data.toString()}`);
                    //     currentContainerId = data.toString();
                    // });

                    // runningContainer.on('exit', (err) => {
                    //     if (err != 0) {
                    //         vscode.window.showInformationMessage("Something wrong happening while starting the development environment is ready");
                    //         console.log(`Exit with error code:  ${err}`);
                    //     }
                    //     else {
                    //         this._containerIds.push(currentContainerId.substr(0, 12));
                    //         vscode.window.showInformationMessage("Development environment is ready!");
                    //         console.log("Development environment successfully running!");
                    //     }

                    // });
                //}
            }

        });
    }

    // Docker exec needs a running container, 
    // TODO:
    // I am using the CLI tf2onnx.convert for converting, right now, right now
    // only supporting conversion from frozen models. The inputs and outputs of the graph are expected to be what 
    // that model generally has.  

    dockerExec(fileuri: any) {
        
        if (!this._workspace || !vscode.workspace.workspaceFolders) { 
            console.log(`No workspace defined`);
            return undefined; 
        }
        if (this._workspace && vscode.workspace.workspaceFolders) {
            console.log(`${path.dirname(fileuri.fsPath).replace(this._workspace.uri.fsPath, this._usermountlocation)}`);
            let model: string = "resnet50";

            if (path.basename(fileuri.fsPath).includes("resnet")) {
                model = "resnet50";
            }

            else if (path.basename(fileuri.fsPath).includes("mobilenet")){
                model =  "mobilenet";
            }

            let exec = cp.spawn('docker', ['exec', '-w', `${path.dirname(fileuri.fsPath).replace(this._workspace.uri.fsPath, this._usermountlocation)}`, 
                                'b3586d48d085', 'python', '-m', 'tf2onnx.convert', '--fold_const', '--opset', '8' ,'--inputs',`${supported_models[model]["inputs"]}`,
                                '--outputs', `${supported_models[model]["outputs"]}`, '--inputs-as-nchw', `${supported_models[model]["inputs"]}` ,'--input' ,
                                `${path.basename(fileuri.fsPath)}` , '--output',`${path.basename(fileuri.fsPath).replace(".pb", ".onnx")}`]);

            console.log("Converting...");
            //TODO: create a logger to log all these
            exec.on('error', (err) => {
                console.log('Failed to exec into the container.');
            });

            exec.stdout.on('data', (data: string) => {
                console.log(`Got this data from the container ${data.toString()}`);

            });

            exec.on('exit', (err: any) => {
                if (err != 0) {
                    vscode.window.showInformationMessage("Conversion failed");
                    console.log(`Exit with error code:  ${err}`);
                }
                else {
                    vscode.window.showInformationMessage("Converted to an ONNX model!");
                    console.log("Converted to an ONNX model!");
                }

            });
        }
    }

    dockerValidate() {

    }

    dockerDisplay(modeluri : vscode.Uri) {
        //let netronCP = cp.spawn('C:\\Program Files\\Netron\\Netron.exe', [`${modeluri.fsPath}`], { env: [] });
        let netronCP = cp.spawn('C:\\Program Files\\Netron\\Netron.exe', [`${modeluri.fsPath}`]);
        netronCP.on('error', (err: any) => {
            console.log(`Failed to start the container with ${err}`);
        });

        netronCP.stdout.on('data', (data: string) => {
            console.log(`container id is ${data.toString()}`);
            this._containerIds.push(data.toString().substr(0, 12));
        });

        netronCP.on('exit', (err: any) => {
            if (err != 0) {
                //vscode.window.showInformationMessage("Conversion failed");
                console.log(`Exit with error code:  ${err}`);

            }
        })
    }
    // TODO: Using mlperf to do the validation, so we should
    // probably have a ui which gives us the info to feed to mlperf, which will be running
    // inside a second container.
    // 
    dockerRunValidation(modelpath: string, inputPath: string, referenceOutputPath: string, currentPanel: vscode.WebviewPanel | undefined) {

        if (this._workspace) {
            let temp = this._workspace.uri.fsPath + "\\";
            let containerInputPath = `C:\\${path.basename(this._workspace.uri.fsPath)}\\${inputPath.replace(temp, "")}`;
            let containerRefPath = `C:\\${path.basename(this._workspace.uri.fsPath)}\\${referenceOutputPath.replace(temp, "")}`;
            let model = `C:\\${path.basename(this._workspace.uri.fsPath)}\\${modelpath.replace(temp, "")}`;
            //let exec = cp.spawn('docker', ['exec', this._imageIds[0], 'python', `C:\\scripts\\mnist_validate.py`, model,  containerInputPath, containerRefPath]);
            let exec = cp.spawn('docker', ['exec', this._imageIds[0], 'python', `C:\\scripts\\mnist_validate.py`, model,  containerInputPath, containerRefPath]);
            console.log(containerInputPath);
            console.log(containerRefPath);
            console.log(model);
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
                    let result_file = path.join(os.tmpdir(), "result.json");

                    if (fs.existsSync(result_file)) {
                        fs.readFile(result_file, (err, data) => {
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
                        console.log(`Couldn't find: ${result_file} on disk.`);
                    }
                    
                    //console.log('In testperformanceHandler');
                    //const perfDataPath: string = path.join(this._context.extensionPath, 'src', 'test', 'data', 'onnxruntime_profile__2019-06-28_04-56-43.json');
                    const perfDataPath: string = path.join(os.tmpdir(), "profile.json");
                    if (fs.existsSync(perfDataPath)) {
                        fs.readFile(perfDataPath, (err, data) => {
                            if (err || data === undefined) {
                                console.log('Error reading data file.');
                            } else {
                                let perfData = JSON.parse(data.toString());
                                try {
                                    let forChart: any = Array.from(perfData).filter(rec => { return ((<any>rec)["cat"] === "Node"); })
                                        .map(rec => ({
                                            "name": `${(<any>rec)["name"] / (<any>rec)["args"]["op_name"]}`,
                                            "dur": (<any>rec)["dur"]
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


                }
            });
        }
    }


    dockerRunMLPerfValidation(model: string, result: string, profile: string, dataFormat: string, count: number, dataset:string, currentPanel: vscode.WebviewPanel | undefined) {
        if (this._workspace) {
            let temp = this._workspace.uri.fsPath + "\\";
            let containerModelPath = `C:\\${path.basename(this._workspace.uri.fsPath)}\\${model.replace(temp, "")}`;
            let containerDatasetPath = `C:\\${path.basename(this._workspace.uri.fsPath)}\\${dataset.replace(temp, "")}`;

            let exec = cp.spawn('docker', ['exec', '-w', `${getMLPerfLocation()}`, 'b3586d48d085', 'python', `${getMLPerfDriver()}`,
                                '--profile', `${profile}`, '--model', `${model}`, '--dataset-path', `${dataset}`,
                                '--output', 'C:\\mount\\'+ result, '--data-format', `${dataFormat}`, '--accuracy',
                                '--count', `${count}`]);
            console.log(containerModelPath);
            console.log(containerDatasetPath);
            console.log(model);
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
                    let result_file = path.join(os.tmpdir(), "result.json");
                    if (currentPanel !== undefined) {
                        currentPanel.webview.postMessage({ command: 'result', payload: "DONE" });
                    }
                    if (fs.existsSync(result_file)) {
                        fs.readFile(result_file, (err, data) => {
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
                        console.log(`Couldn't find: ${result_file} on disk.`);
                    }
                    
                    //console.log('In testperformanceHandler');
                    //const perfDataPath: string = path.join(this._context.extensionPath, 'src', 'test', 'data', 'onnxruntime_profile__2019-06-28_04-56-43.json');
                    const perfDataPath: string = path.join(os.tmpdir(), "profile.json");
                    if (fs.existsSync(perfDataPath)) {
                        fs.readFile(perfDataPath, (err, data) => {
                            if (err || data === undefined) {
                                console.log('Error reading data file.');
                            } else {
                                let perfData = JSON.parse(data.toString());
                                try {
                                    let forChart: any = Array.from(perfData).filter(rec => { return ((<any>rec)["cat"] === "Node"); })
                                        .map(rec => ({
                                            "name": `${(<any>rec)["name"] / (<any>rec)["args"]["op_name"]}`,
                                            "dur": (<any>rec)["dur"]
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


                }
            });
        }
    }

    dispose(): void {

    }
}
