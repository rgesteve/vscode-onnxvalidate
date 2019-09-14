'use strict';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import ContentProvider from './ContentProvider';
import * as utils from './osUtils';
import { supported_models, docker_images } from './config';

export class DockerManager implements vscode.Disposable { // can dispose the vscode context?
    private _imageId: string | undefined; // declare an array of image ids, that exists on the system, conversionContainerImage, QuantizationImage
    private _imageIds: string[];
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
        console.log("Coming here");
        const workspaceFolders: vscode.WorkspaceFolder[] = vscode.workspace.workspaceFolders || [];
        if (workspaceFolders.length != 0 ) {
            // Check if docker is installed and has the image that we require
            this._workspace = workspaceFolders[0];

            let containerTypeCP = cp.spawn('docker', ['info', '-f', `"{{.OSType}}"`]);
            let containerType = "";
            containerTypeCP.stdout.on("data", (data: string): void => {
                containerType = data.toString(); // this should say something like not installed so used that instead of error
            });

            containerTypeCP.on('error', (err) => {
                console.log('Docker client is either not installed or not running!');
            });

            containerTypeCP.on("exit", (data: string | Buffer): void => {
                if (this._workspace) {
                    utils.setMountLocations(this._workspace.uri.fsPath, os.tmpdir(), containerType.trim().replace(/\"/g, ""));
                    console.log('Mount locations set!');
                }
            });
        }
    }

    async executeCommand(command: string, args: string[], options: cp.SpawnOptions = { shell: true }): Promise<string> {
        return new Promise((resolve: (res: string) => void, reject: (error : string) => void): void => {
            let result: string = "";
    
            const childProc: cp.ChildProcess = cp.spawn(command, args, { ...options});
    
            childProc.stdout.on("data", (data: string | Buffer) => {
                data = data.toString();
                result = result.concat(data);
                console.log(`childProc.stdout.on ${result}`);
            });
    
            childProc.stderr.on("data", (data: string | Buffer) => {});
    
            childProc.on("error", reject);
    
            childProc.on("close", (code: number) => {
                if (code !== 0) {
                    reject(`Exited with error code ${code}`);
                } else {
                    resolve(result);
                }
            });
        });
    }
    async executeCommandWithProgress(doneMessage: string, message: string, command: string, args: string[], options: cp.SpawnOptions = { shell: true }): Promise<string> {
        let result: string = "";
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification }, async (p: vscode.Progress<{}>) => {
            return new Promise(async (resolve: (res: string) => void, reject: (e: Error) => void): Promise<void> => {
                p.report({ message }); 
                try {
                    result = await this.executeCommand(command, args, options);
                    p.report({ increment: 100, doneMessage }); // havent figured out how to show the final message yet :(
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
        });
        return result;
    }

    public async getImageId(): Promise<void> {
        let result: string;
        if (utils.g_containerType === "linux") {
            result = await this.executeCommand("docker", ['images', `${docker_images["linux-mlperf"]["name"]}`, '--format', '"{{.Repository}}"']);
            console.log(`executeCommand Result: ${result}`);
        }
        else {
            result = await this.executeCommand("docker", ['images', `${docker_images["windows-mlperf"]["name"]}`, '--format', '"{{.Repository}}"']);
        }
        this._imageId = result.split(':')[0];
        console.log(`Result: ${this._imageId}`);
    }

    public async runImage(): Promise<string|undefined> {
        let runningContainer: string | undefined;
        if (this._imageId && this._workspace) {
            let userWorkspaceMount: string = `source=${this._workspace.uri.fsPath},target=${utils.getLocationOnContainer(this._workspace.uri.fsPath)},type=bind`;
            let extensionMount: string = `source=${utils.g_hostOutputLocation},target=${utils.g_mountOutputLocation},type=bind`;
            let args: string[] = ['run', '-m', '8g','-t', '-d', '--mount', userWorkspaceMount, '--mount', extensionMount, this._imageId];
            runningContainer =  await this.executeCommandWithProgress("Your development environment is ready!", "Starting your development environment...","docker", args);
            this._containerIds.push(runningContainer.substr(0, 12));
            console.log(`Container id: ${this._containerIds[0]}`);
        }
        return runningContainer;
       
    }
            
    public async runExec(): Promise<string|undefined> {
        if (this._containerIds && this._workspace) { // we have a valid running container and a mounted user workspace

        }
        return "";
    }

    public async convert(fileuri: vscode.Uri, ...args: any[]): Promise<void> {
        if (!this._workspace){
            console.log(`No workspace defined`);
            return undefined;
        }
        if (this._workspace) {
            let model: string | undefined;

            if (path.basename(fileuri.fsPath).toLowerCase().includes("resnet")) {
                model = "resnet50";
            }
            else if (path.basename(fileuri.fsPath).toLowerCase().includes("mobilenet")){
                model =  "mobilenet";
            }
            else {
                console.log("This model is not part of the supported models!");
                return undefined;
            }
            if (model) {
                let args: string[] = ['exec', '-w', `/Documents/final_models/resnet50/`, `${this._containerIds[0]}`, 'python3', '-m', 'tf2onnx.convert', 
                                      '--fold_const', '--opset', '8' ,'--inputs',`${supported_models[model]["inputs"]}`, '--outputs', `${supported_models[model]["outputs"]}`,
                                      '--inputs-as-nchw', `${supported_models[model]["inputs"]}` ,'--input' , `${path.basename(fileuri.fsPath)}` , '--output', 
                                      `${path.basename(fileuri.fsPath).replace(".pb", ".onnx")}`];
                let result = await this.executeCommandWithProgress("Finished converting to ONNX!", "Converting to ONNX... ", "docker", args);
                
            }

        }

    }
    // Docker exec needs a running container, 
    // TODO:
    // I am using the CLI tf2onnx.convert for converting, right now, right now
    // only supporting conversion from frozen models. The inputs and outputs of the graph are expected to be what 
    // that model generally has.  

    public async dockerExec(fileuri: vscode.Uri, ...args: any[]): Promise<void> {
        
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

            let exec = cp.spawn('docker', ['exec', '-w', `${utils.getMLPerfLocation()}`, 'b3586d48d085', 'python', `${utils.getMLPerfDriver()}`,
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

    public dispose(): void {

    }
}
