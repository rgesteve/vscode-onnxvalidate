import * as path from 'path';

export let g_mountLocation: string = "";
export let g_hostLocation: string = "";

export let g_mountOutputLocation: string = "";
export let g_hostOutputLocation: string = "";
export let g_containerType: string = "";

export async function setMountLocations(userMount: string, extMount: string, containerType: string) : Promise<void> { 
    console.log(`1 Mount locations: ${g_mountLocation}, ${g_mountOutputLocation} , ${g_containerType}`, `${containerType}`);
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
    console.log(`2 Mount locations: ${g_mountLocation}, ${g_mountOutputLocation} , ${g_containerType}`, `${containerType}`);
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
    else {
        retString = `${g_mountLocation}${pathOnHost.replace(g_hostLocation, "")}`;
    }
    return retString;
}  
