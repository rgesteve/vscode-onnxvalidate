'use strict';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as utils from './osUtils';
import * as configs from './config';
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
                dlToolkitChannel.appendLine("error", `Error: ${err}`);

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

    async exeCmd(cmd: string, args: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            let result: string = "";

            const childProc: cp.ChildProcess = cp.spawn(cmd, args, { shell: true });

            childProc.stdout.on("data", (data: string | Buffer) => {
                data = data.toString();
                dlToolkitChannel.append("info", data);
                result = result.concat(data);
            });

            childProc.stderr.on("data", (data: string | Buffer) => {
                dlToolkitChannel.appendLine("warning", data.toString());
            });

            childProc.on("error", (data: string | Buffer) => { reject(data) });

            childProc.on("close", (code: number) => {
                if (code !== 0) {
                    reject(code);
                } else {
                    resolve(result);
                }
            });
        });
    }

    async exeCmdProgressBar(mes: string, cmd: string, args: string[]): Promise<string> {
        let result: string = "";
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification }, async (p) => {
            return new Promise(async (resolve, reject) => {
                p.report({ message: mes });
                try {
                    result = await this.exeCmd(cmd, args);
                    resolve(result);
                } catch (e) {
                    dlToolkitChannel.appendLine("error", `Error: ${e}`);
                    reject(e);
                }
            });
        });
        return result;
    }

    public async getContainerType(): Promise<string> {
        let containerType = await this.exeCmd("docker", ['info', '-f', `{{.OSType}}`]);
        if (!containerType) {
            return Promise.reject("Container type is empty");
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

    public async getImageId(): Promise<string> {
        let imageID: string = "";
        if (utils.g_containerType === "linux") {
            imageID = await this.exeCmd("docker", ['images', "chanchala/mlperf_linux7:latest", '--format', '"{{.Repository}}"']);
            if (!imageID || 0 === imageID.length) { // image doesnt exist
                await this.exeCmd("docker", ["pull", "chanchala7/mlperf_linux:latest"])
                try {
                    imageID = await this.exeCmd("docker", ['images', "chanchala7/mlperf_linux:latest", '--format', '"{{.Repository}}"']);
                    dlToolkitChannel.appendLine("info", `imageID: ${imageID}`);
                } catch (e) {
                    dlToolkitChannel.appendLine("error", `Docker pull failed with ${e}`);
                };
            }
        }
        else if (utils.g_containerType === "windows") {
            imageID = await this.exeCmd("docker", ['images', `${configs.docker_images["windows-mlperf"]["name"]}`, '--format', '"{{.Repository}}"']);
            if (!imageID || 0 === imageID.length) { // image doesnt exist
                await this.exeCmd("docker", ["pull", `${configs.docker_images["windows-mlperf"]["name"]}`]);
                try {
                    imageID = await this.exeCmd("docker", ['images', "chanchala7/my_ubuntu", '--format', '"{{.Repository}}"']);
                    dlToolkitChannel.appendLine("info", `imageID: ${imageID}`);
                } catch (e) {
                    dlToolkitChannel.appendLine("error", `Docker pull failed with ${e}`);
                };
            }
        }
        else { // containerType was not set correctly
            dlToolkitChannel.appendLine("error", "There is some issue with docker. Please make sure that docker is running and run \
                                        'DL Toolkit: Reinitialize'" );
            return Promise.reject("There is some issue with docker. Please make sure that docker is running and run 'DL Toolkit: Reinitialize'");
        }

        this._imageId = imageID;
        if (imageID == "") {
            dlToolkitChannel.appendLine("error", `ImageID is empty`);
            return Promise.reject("Empty image id");
        }
        dlToolkitChannel.appendLine("info", `ImageID : ${imageID}`);
        return imageID;
    }

    public async runImage(): Promise<string> {

        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return Promise.reject("No workspace defined");
        }

        if (!this._imageId) {
            dlToolkitChannel.appendLine("error", "No imageId found");
            return Promise.reject("No imageId found");
        }

        let userWorkspaceMount: string = `source=${utils.g_hostLocation},target=${utils.g_mountLocation},type=bind`;
        let extensionMount: string = `source=${utils.g_hostOutputLocation},target=${utils.g_mountOutputLocation},type=bind`;
        let args: string[] = ['run', '-m', '4g', '-t', '-d', '--mount', userWorkspaceMount, '--mount', extensionMount, this._imageId];
        let runningContainer = await this.exeCmdProgressBar("Starting your development environment...", "docker", args).catch(err => {
                dlToolkitChannel.appendLine("error", err);
            });
        if (runningContainer) {
            this._containerIds.push(runningContainer.substr(0, 12));
            dlToolkitChannel.appendLine("info", `ContainerId: ${this._containerIds[0]}`);
            return runningContainer;
        }
        else
            return Promise.reject("Couldnot get a running comtainer");

    }

    public async convert(convertParams: Map<string, string>): Promise<string> {

        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return Promise.reject("No workspace defined");

        }

        let modelToConvert: string | undefined = convertParams.get("input");
        if (!modelToConvert) {
            dlToolkitChannel.appendLine("error", `No input model provided`);
            return Promise.reject("No input model provided");
        }

        let args: string[] = ['exec', '-w', `${utils.getLocationOnContainer(path.dirname(modelToConvert))}`, `${this._containerIds[0]}`, 'python3', '-m', 'tf2onnx.convert',];
        if (convertParams.get("inputs") === undefined) {
            if (path.basename(modelToConvert).toLowerCase().includes("resnet")) {
                args.push("--inputs");
                args.push(`${configs.supported_models["resnet50"]["inputs"]}`);
                args.push("--inputs-as-nchw");
                args.push(`${configs.supported_models["resnet50"]["inputs"]}`);
            }
            else if (path.basename(modelToConvert).toLowerCase().includes("mobilenet")) {
                args.push("--inputs");
                args.push(`${configs.supported_models["mobilenet"]["inputs"]}`);
                args.push("--inputs-as-nchw");
                args.push(`${configs.supported_models["mobilenet"]["inputs"]}`);
            }
            else {
                dlToolkitChannel.appendLine("error", "This model is not part of the supported models!");
                return Promise.reject("No input model provided");
            }
        }

        if (convertParams.get("outputs") === undefined) {
            if (path.basename(modelToConvert).toLowerCase().includes("resnet")) {
                args.push("--outputs");
                args.push(`${configs.supported_models["resnet50"]["outputs"]}`);
            }
            else if (path.basename(modelToConvert).toLowerCase().includes("mobilenet")) {
                args.push("--outputs");
                args.push(`${configs.supported_models["mobilenet"]["outputs"]}`);
            }
            else {
                dlToolkitChannel.appendLine("error", "This model is not part of the supported models!");
                return Promise.reject("This model is not part of the supported models!");;
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
        
        //let test = await this.exeCmdProgressBar("Converting to ONNX...", "docker", args);
        return await this.exeCmdProgressBar("Converting to ONNX...", "docker", args);
    }

    public async summarizeGraph(fileuri: string): Promise<string> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return Promise.reject("No workspace defined");
        }

        let args: string[] = ['exec', `${this._containerIds[0]}`, `${configs.tensorflow_binaries[utils.g_containerType]["summarize"]}`, '--in_graph=' + `${utils.getLocationOnContainer(fileuri)}`];
        dlToolkitChannel.appendLine("info", `Summarize params ${args}`);
        return await this.exeCmd("docker", args);
    }


    public async quantizeModel(quantizeParam: Map<string, string>): Promise<string> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return Promise.reject("No workspace defined");
        }
        let model: string | undefined = quantizeParam.get("model_path");
        if (!model) {
            dlToolkitChannel.appendLine("error", "Model not found!");
            return Promise.reject("Model not found!");
        }

        let fileExt = model.split('.').pop();
        if (fileExt === 'pb') // tensorflow quantization to follow
        {
            return await this.quantizeTFModel(quantizeParam);
        }
        else if (fileExt === 'onnx') // onnx quantization to follow
        {
            return await this.quantizeONNXModel(quantizeParam);
        }
        else {
            dlToolkitChannel.appendLine("error", "This model is not supported for quantization!");
            return Promise.reject("This model is not supported for quantization!");
        }


    }

    public async quantizeONNXModel(quantizeParam: Map<string, string>): Promise<string> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return Promise.reject("No workspace defined");
        }

        let model: string | undefined = quantizeParam.get("model_path");
        if (!model) {
            dlToolkitChannel.appendLine("error", "Model not found!");
            return Promise.reject("Model not found!");
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
        return await this.exeCmdProgressBar("Quantizing ONNX FP32 model to ONNX int8 model... ", "docker", args);
    }

    public async quantizeTFModel(quantizeParam: Map<string, string>): Promise<string> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return Promise.reject("No workspace defined");
        }
        let model: string | undefined = quantizeParam.get("model");

        if (!model) {
            dlToolkitChannel.appendLine("error", "Model not found");
            return Promise.reject("Model not found");
        }

        if (model.toLowerCase().includes("resnet")) {
            model = "resnet50";
        }
        else if (model.toLowerCase().includes("mobilenet")) {
            model = "mobilenet";
        }
        else {
            dlToolkitChannel.appendLine("error", "This model is not part of the supported models!");
            return Promise.reject("This model is not part of the supported models!");
        }

        let args: string[] = ['exec', '-w', `${utils.getLocationOnContainer(path.dirname(model))}`, `${this._containerIds[0]}`, `${configs.tensorflow_binaries[utils.g_containerType]["transform"]}`,
            '--in_graph=', `${path.basename(model)}`, '--out_graph=', `${path.basename(model).replace(".pb", "_quantized.pb")}`,
            '--inputs=', `${configs.supported_models[model]["inputs"]}`, '--outputs=', `${configs.supported_models[model]["outputs"]}`, '--transforms=', `${configs.tensorflow_quantization_options}`];
        dlToolkitChannel.appendLine("info", `Quantize params ${args}`);
        return await this.exeCmdProgressBar( "Quantizing TF FP32 model to TF int8 model... ", "docker", args);

    }

    public async validation(mlperfParams: Map<string, string>): Promise<string> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine("error", `No workspace defined`);
            return Promise.reject("No workspace defined");
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
        return await this.exeCmdProgressBar("Validating model with MLPerf... ", "docker", args);
    }


    public dispose(): void {
        this.exeCmd("docker", ["stop", `${this._containerIds[0]}`]);
    }
}

export const dockerManager: DockerManager = new DockerManager();