import * as path from 'path';
import { dlToolkitChannel } from './dlToolkitChannel';
import * as configs from './config'
import * as vscode from 'vscode';
import { WorkspaceConfiguration } from 'vscode';
export let g_mountLocation: string = "";
export let g_hostLocation: string = "";

export let g_mountOutputLocation: string = "";
export let g_hostOutputLocation: string = "";
export let g_containerType: string = "";

export function getMountLocation(): string | undefined {
    const config: WorkspaceConfiguration = vscode.workspace.getConfiguration("dl-toolkit");
    let mountLocation: string | undefined = config.get<string>("mountLocation");

    if (!mountLocation) // user didnt define the mount location, then use the open workspace
    {
        const workspaceFolders: vscode.WorkspaceFolder[] = vscode.workspace.workspaceFolders || [];
        if (workspaceFolders.length != 0) {
            mountLocation = workspaceFolders[0].uri.fsPath;
        }
        else {
            dlToolkitChannel.appendLine("error", `No workspace open or mount location specified`);
        }
    }
    return mountLocation;
}

export function setMountLocations(userMount: string, extMount: string, containerType: string): void {

    g_containerType = containerType;

    if ((isWindows() && containerType === 'linux') || !isWindows()) {
        g_hostLocation = userMount;
        g_mountLocation = `/${path.basename(userMount)}`;
        g_hostOutputLocation = extMount;
        g_mountOutputLocation = `/${path.basename(extMount)}`;
    }
    else {
        g_hostLocation = userMount;
        g_mountLocation = `C:\\${path.basename(userMount)}`;
        g_hostOutputLocation = extMount;
        g_mountOutputLocation = `/${path.basename(extMount)}`;
    }
    dlToolkitChannel.appendLine("info", `2 Mount locations: ${g_mountLocation}, ${g_mountOutputLocation} , ${g_containerType} , ${containerType}`);
}

export function isWindows(): boolean {
    return process.platform === "win32";
}

export function getMLPerfLocation(): string {
    return configs.mlperf[g_containerType]["location"];
}

export function getMLPerfDriver(): string {
    return configs.mlperf[g_containerType]["driver"];
}

export function getLocationOnContainer(pathOnHost: string | undefined): string {
    let retString = "";
    if (pathOnHost != undefined) {
        if (isWindows() && g_containerType === 'windows')
            retString = `${g_mountLocation}\\${pathOnHost.replace(g_hostLocation, "")}`;
        else if (isWindows() && g_containerType === 'linux') {
            let temp: string = pathOnHost.replace(g_hostLocation, g_mountLocation);
            retString = temp.replace(/\\/g, "/");
        }

        else
            retString = `${g_mountLocation}${pathOnHost.replace(g_hostLocation, "")}`;
    }

    return retString;
}

export function getScriptsLocationOnContainer(): string {
    return configs.scriptsLocation[g_containerType]["location"];
}