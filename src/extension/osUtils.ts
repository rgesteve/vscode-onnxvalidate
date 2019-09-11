import * as path from 'path';

export let g_mountLocation: string = ""
export let g_hostLocation: string = ""

export function setMountLocation(hostLocation: string) : void {
    if (isWindows()) {
       g_hostLocation = hostLocation; 
        g_mountLocation = `C:\\${path.basename(hostLocation)}`;
    }
    else {
        g_hostLocation = hostLocation; 
        g_mountLocation = `/${path.basename(hostLocation)}`;
    }
}

export function isWindows(): boolean {
    return process.platform === "win32";
}

export function getMLPerfLocation(): string {
    if (isWindows())
        return "C:\\inference\\v0.5\\classification_and_detection";
    else
        return "/inference/v0.5/classification_and_detection";
}

export function getMLPerfDriver(): string {
    if (isWindows())
        return "python\\main.py";
    else
        return "python/main.py";
}

export function getLocationOnContainer (pathOnHost: string ): string {
    let retString = "";
    if (isWindows())
        retString = `${g_mountLocation}\\${pathOnHost.replace(g_hostLocation, "")}`;
    else
        retString = `${g_hostLocation}/${pathOnHost.replace(g_hostLocation, "")}`;
    return retString;
}  

