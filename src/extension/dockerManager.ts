'use strict';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as utils from './osUtils';
import { supported_models, docker_images, tensorflow_binaries, tensorflow_quantization_options } from './config';
import { dlToolkitChannel } from "./dlToolkitChannel";


class DockerManager implements vscode.Disposable {
    private _imageId: string | undefined;
    private _containerIds: string[];
    private _workspace: vscode.WorkspaceFolder | undefined;

    constructor() {
        this._containerIds = [];

        const workspaceFolders: vscode.WorkspaceFolder[] = vscode.workspace.workspaceFolders || [];
        if (workspaceFolders.length != 0) {
            // Check if docker is installed and has the image that we require
            this._workspace = workspaceFolders[0];

            let containerTypeCP = cp.spawn('docker', ['info', '-f', `"{{.OSType}}"`]);
            let containerType = "";
            containerTypeCP.stdout.on("data", (data: string): void => {
                dlToolkitChannel.append("info", data);
                containerType = containerType + data.toString();
            });

            containerTypeCP.on('error', (err) => {
                dlToolkitChannel.appendLine("error", 'Docker client is either not installed or not running!');
                dlToolkitChannel.appendLine("error", `Got error ${err}`);

            });

            containerTypeCP.on("exit", (data: string | Buffer): void => {
                if (this._workspace) {
                    containerType = containerType.trim().replace(/\"/g, "");
                    if (containerType === 'linux' || containerType === 'windows') {
                        utils.setMountLocations(this._workspace.uri.fsPath, os.tmpdir(), containerType);
                        dlToolkitChannel.appendLine("info", `Mount locations set! ${this._workspace.uri.fsPath}, ${os.tmpdir()}`);
                    }
                    else {
                        dlToolkitChannel.appendLine("error", "Docker doesnt seem to be running! Please make sure that docker is running and run \
                                                     `DL Toolkit: Reinitialize ecosystem" );
                    }
                }
            });
        }
        else {
            dlToolkitChannel.appendLine("error", "No workspace open! Please open your development folder(workspace)");
        }
    }

    public async getContainerType(): Promise<string | undefined> {
        let containerType: string | undefined = await this.executeCommand("docker", ['info', '-f', `{{.OSType}}`]);
        if (!containerType) {
            return undefined;
        }
        else {
            containerType = containerType.trim().replace(/\"/g, "");
            if (this._workspace) {
                if (containerType === "linux" || containerType === "windows") {
                    utils.setMountLocations(this._workspace.uri.fsPath, os.tmpdir(), containerType);
                    dlToolkitChannel.appendLine("info", `Mount locations set! ${this._workspace.uri.fsPath}, ${os.tmpdir()}`);
                }
            }
            else {
                dlToolkitChannel.appendLine("error", "No open workspace found! Please open your workspace");
            }
            return containerType;
        }
    }


    async executeCommand(command: string, args: string[], options: cp.SpawnOptions = { shell: true }): Promise<string> {
        return new Promise((resolve: (res: string) => void, reject: (error: string | Buffer) => void): void => {
            let result: string = "";

            const childProc: cp.ChildProcess = cp.spawn(command, args, { ...options });

            childProc.stdout.on("data", (data: string | Buffer) => {
                data = data.toString();
                dlToolkitChannel.append("info", data);
                result = result.concat(data);
            });

            childProc.stderr.on("data", (data: string | Buffer) => {
                dlToolkitChannel.appendLine("warning", data.toString());
            });

            childProc.on("error", (data: string | Buffer) => { reject(`Exited with error ${data}`) });

            childProc.on("close", (code: number) => {
                if (code !== 0) {
                    reject(`Exited with error ${code}`);
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
                    p.report({ increment: 100, doneMessage }); // havent figured out how to show the final message yet 
                    resolve(result);
                } catch (e) {
                    dlToolkitChannel.appendLine("error", `Reject ${e}`);
                    reject(e);
                }
            });
        });
        return result;
    }

    public async getImageId(): Promise<string | undefined> {
        let imageID: string | undefined;
        if (utils.g_containerType === "linux") {
            imageID = await this.executeCommand("docker", ['images', "chanchala7/mlperf_linux:latest", '--format', '"{{.Repository}}"']);
            if (!imageID || 0 === imageID.length) { // image doesnt exist
                await this.executeCommand("docker", ["pull", "chanchala7/mlperf_linux:latest"]).then(async () => {
                    imageID = await this.executeCommand("docker", ['images', "chanchala7/mlperf_linux:latest", '--format', '"{{.Repository}}"']);
                    dlToolkitChannel.appendLine("info", `imageID: ${imageID}`);
                }, reason => {
                    dlToolkitChannel.appendLine("error", "Docker pull failed");
                });
            }
        }
        else if (utils.g_containerType === "windows") {
            imageID = await this.executeCommand("docker", ['images', `${docker_images["windows-mlperf"]["name"]}`, '--format', '"{{.Repository}}"']);
            if (!imageID || 0 === imageID.length) { // image doesnt exist
                await this.executeCommand("docker", ["pull", `${docker_images["windows-mlperf"]["name"]}`]).then(async () => {
                    imageID = await this.executeCommand("docker", ['images', "chanchala7/my_ubuntu", '--format', '"{{.Repository}}"']);
                    dlToolkitChannel.appendLine("info", `imageID: ${imageID}`);
                }, reason => {
                    dlToolkitChannel.appendLine("error", `Docker pull failed with ${reason}`);
                });
            }
        }
        else { // containerType was not set correctly
            dlToolkitChannel.appendLine("error", "There is some issue with docker. Please make sure that docker is running and run \
                                        `DL Toolkit: Check container type" );
            return imageID;
        }

        this._imageId = imageID;
        dlToolkitChannel.appendLine("info", `ImageID : ${imageID}`);
        return imageID;
    }

    public async runImage(): Promise<string | undefined> {
        let runningContainer: string | undefined;
        if (this._imageId && this._workspace) {
            let userWorkspaceMount: string = `source=${utils.g_hostLocation},target=${utils.g_mountLocation},type=bind`;
            let extensionMount: string = `source=${utils.g_hostOutputLocation},target=${utils.g_mountOutputLocation},type=bind`;
            let args: string[] = ['run', '-m', '4g', '-t', '-d', '--mount', userWorkspaceMount, '--mount', extensionMount, this._imageId];
            runningContainer = await this.executeCommandWithProgress("Your development environment is ready!", "Starting your development environment...", "docker", args);
            this._containerIds.push(runningContainer.substr(0, 12));
            dlToolkitChannel.appendLine("info", `ContainerId: ${this._containerIds[0]}`);
        }
        return runningContainer;

    }

    public async convert(convertParams: Map<string, string>): Promise<string | undefined> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return undefined;
        }

        let modelToConvert: string | undefined = convertParams.get("input");
        if (!modelToConvert) {
            dlToolkitChannel.appendLine("error", `No input model provided`);
            return undefined;
        }

        let args: string[] = ['exec', '-w', `${utils.getLocationOnContainer(path.dirname(modelToConvert))}`, `${this._containerIds[0]}`, 'python3', '-m', 'tf2onnx.convert',];
        if (convertParams.get("inputs") === undefined) {
            if (path.basename(modelToConvert).toLowerCase().includes("resnet")) {
                args.push("--inputs");
                args.push(`${supported_models["resnet50"]["inputs"]}`);
                args.push("--inputs-as-nchw");
                args.push(`${supported_models["resnet50"]["inputs"]}`);
            }
            else if (path.basename(modelToConvert).toLowerCase().includes("mobilenet")) {
                args.push("--inputs");
                args.push(`${supported_models["mobilenet"]["inputs"]}`);
                args.push("--inputs-as-nchw");
                args.push(`${supported_models["mobilenet"]["inputs"]}`);
            }
            else {
                dlToolkitChannel.appendLine("error", "This model is not part of the supported models!");
                return undefined;
            }
        }

        if (convertParams.get("outputs") === undefined) {
            if (path.basename(modelToConvert).toLowerCase().includes("resnet")) {
                args.push("--outputs");
                args.push(`${supported_models["resnet50"]["outputs"]}`);
            }
            else if (path.basename(modelToConvert).toLowerCase().includes("mobilenet")) {
                args.push("--outputs");
                args.push(`${supported_models["mobilenet"]["outputs"]}`);
            }
            else {
                dlToolkitChannel.appendLine("error", "This model is not part of the supported models!");
                return undefined;
            }
        }

        if (convertParams.get("opset") === undefined) {
            args.push("--opset");
            args.push("8");
        }
        for (var [key, value] of convertParams) {
            if (value) {
                if (key === 'input') {
                    args.push(`--${key}`);
                    args.push(utils.getLocationOnContainer(value));
                    dlToolkitChannel.appendLine("info", `Location on container: ${utils.getLocationOnContainer(value)}`)
                }
                else {
                    args.push(`--${key}`);
                    args.push(value);
                    if (key === 'inputs') { // need to set the input format
                        args.push("--inputs-as-nchw");
                        args.push(value);
                    }
                }
            }
        }

        args.push("--output");
        args.push(`${path.basename(modelToConvert).replace(".pb", ".onnx")}`);

        dlToolkitChannel.appendLine("info", `Convert params ${args}`);
        return await this.executeCommandWithProgress("Finished converting", "Converting to ONNX...", "docker", args);
    }

    public async summarizeGraph(fileuri: string): Promise<string | undefined> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return undefined;
        }
        let args: string[] = ['exec', `${this._containerIds[0]}`, `${tensorflow_binaries[utils.g_containerType]["summarize"]}`, '--in_graph=' + `${utils.getLocationOnContainer(fileuri)}`];
        dlToolkitChannel.appendLine("info", `Summarize params ${args}`);
        return await this.executeCommand("docker", args);
    }


    public async quantizeModel(quantizeParam: Map<string, string>): Promise<string | undefined> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return undefined;
        }
        let model: string | undefined = quantizeParam.get("model_path");
        if (model) {
            let fileExt = model.split('.').pop();
            if (fileExt === 'pb') // tensorflow quantization to follow
            {
                return this.quantizeTFModel(quantizeParam);
            }
            else if (fileExt === 'onnx') // onnx quantization to follow
            {
                return this.quantizeONNXModel(quantizeParam);
            }
            else {
                dlToolkitChannel.appendLine("error", "This model is not supported for quantization!");
                return "This model is not supported for quantization!";
            }
        }
        else {
            dlToolkitChannel.appendLine("error", "Model not found!");
            return "Model not found!";
        }

    }

    public async quantizeONNXModel(quantizeParam: Map<string, string>): Promise<string | undefined> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return undefined;
        }
        let model: string | undefined = quantizeParam.get("model_path");

        if (!model) {
            dlToolkitChannel.appendLine("error", "Model not found!");
            return "Model not found!";
        }

        let args: string[] = ['exec', '-w', `${utils.getScriptsLocationOnContainer()}`, `${this._containerIds[0]}`, 'python3']
        if (quantizeParam.size == 1) {
            args.push('quantizeDriver.py');
            args.push(`--model_path=${model}`);
        }
        else {
            args.push('calibrate.py');
            for (var [key, value] of quantizeParam) {
                if (key === 'dataset_path' || key === 'model_path' || key === 'data_preprocess_filepath') {
                    args.push(`--${key}=${utils.getLocationOnContainer(value)}`);
                    dlToolkitChannel.appendLine("info", `Location on container: ${utils.getLocationOnContainer(value)}`)
                }
                else {
                    args.push(`--${key}=${value}`);
                }
            }
        }

        dlToolkitChannel.appendLine("info", `Quantize params ${args}`);
        return await this.executeCommandWithProgress("Quantization done", "Quantizing ONNX FP32 model to ONNX int8 model... ", "docker", args);
    }

    public async quantizeTFModel(quantizeParam: Map<string, string>): Promise<string | undefined> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return undefined;
        }
        let model: string | undefined = quantizeParam.get("model");

        if (!model) {
            dlToolkitChannel.appendLine("error", "Model not found!");
            return "Model not found!";
        }

        if (model.toLowerCase().includes("resnet")) {
            model = "resnet50";
        }
        else if (model.toLowerCase().includes("mobilenet")) {
            model = "mobilenet";
        }
        else {
            dlToolkitChannel.appendLine("error", "This model is not part of the supported models!");
            return undefined;
        }

        let args: string[] = ['exec', '-w', `${utils.getLocationOnContainer(path.dirname(model))}`, `${this._containerIds[0]}`, `${tensorflow_binaries[utils.g_containerType]["transform"]}`,
            '--in_graph=', `${path.basename(model)}`, '--out_graph=', `${path.basename(model).replace(".pb", "_quantized.pb")}`,
            '--inputs=', `${supported_models[model]["inputs"]}`, '--outputs=', `${supported_models[model]["outputs"]}`, '--transforms=', `${tensorflow_quantization_options}`];
        dlToolkitChannel.appendLine("info", `Quantize params ${args}`);
        return await this.executeCommandWithProgress("Quantization done", "Quantizing TF FP32 model to TF int8 model... ", "docker", args);

    }

    dockerDisplay(modeluri: vscode.Uri) {
        //let netronCP = cp.spawn('C:\\Program Files\\Netron\\Netron.exe', [`${modeluri.fsPath}`], { env: [] });
        let netronCP = cp.spawn('C:\\Program Files\\Netron\\Netron.exe', [`${modeluri.fsPath}`]);
        netronCP.on('error', (err: any) => {
            dlToolkitChannel.appendLine("error", `Failed to start the container with ${err}`);
        });

        netronCP.stdout.on('data', (data: string) => {
            dlToolkitChannel.appendLine("info", `container id is ${data.toString()}`);
            this._containerIds.push(data.toString().substr(0, 12));
        });

        netronCP.on('exit', (err: any) => {
            if (err != 0) {

                dlToolkitChannel.appendLine("error", `Exit with error code:  ${err}`);

            }
        })
    }

    public async validation(mlperfParams: Map<string, string>): Promise<string | undefined> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return undefined;
        }

        let args: string[] = ['exec', '-w', `${utils.getMLPerfLocation()}`, `${this._containerIds[0]}`, 'python3', `${utils.getMLPerfDriver()}`,];
        for (var [key, value] of mlperfParams) {
            if (key === 'dataset-path' || key === 'model') {
                args.push(`--${key}`);
                args.push(utils.getLocationOnContainer(value));
                dlToolkitChannel.appendLine("info", `Location on container: ${utils.getLocationOnContainer(value)}`)
            }
            else {
                args.push(`--${key}`);
                args.push(value);
            }
        }
        args.push("--accuracy");
        args.push("--output");
        if (utils.g_containerType === 'linux') {
            args.push(`${utils.g_mountOutputLocation}/MLPerf/`);
        }
        else {
            args.push(`${utils.g_mountOutputLocation}\\MLPerf`);
        }

        dlToolkitChannel.appendLine("info", `MLPerf args ${args}`);
        return await this.executeCommandWithProgress("Finished Validation", "Validating model with MLPerf... ", "docker", args);
    }


    public dispose(): void {
        this.executeCommand("docker", ["stop", `${this._containerIds[0]}`]);
    }
}

export const dockerManager: DockerManager = new DockerManager();