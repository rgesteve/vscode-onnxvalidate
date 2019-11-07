import * as path from 'path';
import { dlToolkitChannel} from './dlToolkitChannel';

export let g_mountLocation: string = "";
export let g_hostLocation: string = "";

export let g_mountOutputLocation: string = "";
export let g_hostOutputLocation: string = "";
export let g_containerType: string = "";

export async function setMountLocations(userMount: string, extMount: string, containerType: string) : Promise<void> {

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
    dlToolkitChannel.appendLine("info",`2 Mount locations: ${g_mountLocation}, ${g_mountOutputLocation} , ${g_containerType} , ${containerType}`);
}

export function isWindows(): boolean {
    return process.platform === "win32";
}

export function getMLPerfLocation(): string {
    if (g_containerType === 'windows')
        return "C:\\inference\\v0.5\\classification_and_detection";
    else
        return "/inference/v0.5/classification_and_detection";
}

export function getMLPerfDriver(): string {
    if (g_containerType === 'windows')
        return "python\\main.py";
    else
        return "python/main.py";
}

export function getLocationOnContainer (pathOnHost: string | undefined): string {
    let retString = "";
    if (pathOnHost != undefined) {
        if (isWindows() && g_containerType === 'windows')
            retString = `${g_mountLocation}\\${pathOnHost.replace(g_hostLocation, "")}`;
        else if (isWindows() && g_containerType === 'linux') {
            let temp:string  = `${pathOnHost.replace(g_hostLocation, g_mountLocation)}`;
            retString = temp.replace(/\\/g, "/");
            dlToolkitChannel.appendLine("info", `Path ${pathOnHost} translates to ${retString}`);
        }

        else
            retString = `${g_mountLocation}${pathOnHost.replace(g_hostLocation, "")}`;
        dlToolkitChannel.appendLine("info", `Path ${pathOnHost} translates to ${retString}`);
    }

    return retString;
}

export function getScriptsLocationOnContainer() : string {
    if (g_containerType === 'windows')
        return "C:\\scripts";
    else
        return "/scripts";
}