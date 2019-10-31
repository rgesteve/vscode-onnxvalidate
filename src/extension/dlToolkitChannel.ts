import * as vscode from 'vscode';
import timestamp from 'time-stamp';

class DLToolkitChannel implements vscode.Disposable {
    private readonly channel: vscode.OutputChannel = vscode.window.createOutputChannel("DLToolkitChannel");

    public appendLine(message: string): void {
        this.channel.appendLine(timestamp('YYYY/MM/DD: HH:mm:ss:ms ') + message);
    }

    public append(message: string): void {
        this.channel.append(timestamp('YYYY/MM/DD: HH:mm:ss:ms ') + message);
    }

    public show(): void {
        this.channel.show();
    }

    public dispose(): void {
        this.channel.dispose();
    }
}

export const dlToolkitChannel : DLToolkitChannel = new DLToolkitChannel();
