import { Uri, ExtensionContext, Extension } from 'vscode';
import { join } from 'path';

export default class ContentProvider {
    private _userMountLocation: string | ""
    constructor (userMountLocation: string){
      this._userMountLocation = userMountLocation;
    }
    getProdContent(context : ExtensionContext ) {
        const unBundleDiskPath = Uri.file(join(context.extensionPath, "out", "webview", "webview.bundle.js"));
        const unBundlePath = unBundleDiskPath.with({ scheme: 'vscode-resource'});
        return `
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Model validation comparison</title>
          </head>
          <body>
            <div id="root"></div>
            <script src="${unBundlePath}" type="text/javascript"></script>
          </body>
        </html>
        `;
    }
}