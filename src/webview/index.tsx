import React from 'react';
import ReactDOM from 'react-dom';

import { Stack, TextField, PrimaryButton } from "office-ui-fabric-react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

declare var acquireVsCodeApi : any;
const vscode = acquireVsCodeApi();

const App : React.SFC = () => {

    const tokens = {
        fiveGapStack : {
            childrenGap : 5
        }
    };

    const state = {
        columnDefs : [
            {headerName : 'Inputs',  field : 'make'},
            {headerName : 'Actual', field : 'model'},
            {headerName : 'Predicted', field : 'price'},
        ],
        rowData : [{"make":"Toyota","model":"Celica","price":35000},
                    {"make":"Ford","model":"Mondeo","price":32000},
                    {"make":"Porsche","model":"Boxter","price":72000},
                    {"make":"Toyota","model":"Celica","price":35000},
                    {"make":"Ford","model":"Mondeo","price":32000},
                    {"make":"Porsche","model":"Boxter","price":72000},
                    {"make":"Toyota","model":"Celica","price":35000},
                    {"make":"Ford","model":"Mondeo","price":32000},
                    {"make":"Porsche","model":"Boxter","price":72000},
                    {"make":"Toyota","model":"Celica","price":35000},
                ]
    };

    const [count, setCount] = React.useState(0);
    const [inputFile, setInputFile] = React.useState("");
    const [outputFile, setOutputFile] = React.useState("");
    const [result, setResult] = React.useState("");

    React.useEffect( () => {
        window.addEventListener('message', (ev) => {
            //ev.data
            switch(ev.data.command) {
                case "inputFile": {
                    console.log(`Got a message from the host ${ev.data}`);
                    setInputFile(ev.data.payload);
                    break;
                }
                case "outputFile": {
                    console.log(`Got a message from the host ${ev.data}`);
                    setOutputFile(ev.data.payload);
                    break;
                }
                case "result": {
                    console.log(`Got a message from the host ${ev.data}`);
                    setResult(ev.data.payload);
                    break;
                }
            }
        });
    }, []);

    let objectsInVSCode = Object.keys(vscode).join(',');

    let clickHandler = () => {
        window.console.log(`Curious to see where ${count} value is.`);
        vscode.postMessage({
            command : 'startVerification',
            text: 'check out from host'
        });
        window.console.log(`Sent message to host.`);

    };
    let inputHandler = () => {
        window.console.log("Select test input");
        vscode.postMessage({
            command : 'setInputFile',
            text: 'Select test input'
        });
        window.console.log(`Sent message to host.`);

    };
    let outputHandler = () => {
        window.console.log("Select reference output");
        vscode.postMessage({
            command : 'setOutputFile',
            text: 'Select reference output'
        });
        window.console.log(`Sent message to host.`);

    };

    let cancelHandler = () => {
        window.console.log("Select reference output");
        vscode.postMessage({
            command : 'cancel',
            text: 'Cancel'
        });
        window.console.log(`Sent message to host.`);

    };

    return (
        <div>
            <Stack tokens={tokens.fiveGapStack}>
                <Stack.Item align="stretch">
                    <span>Enter directory containing inputs</span>
                    <TextField value= { `${inputFile}` }placeholder="Inputs..." />
                    <span>Enter file containing validation</span>
                    <TextField value={`${outputFile}`} placeholder="Reference outputs..." />
                </Stack.Item>
                <Stack.Item align="center">
                    <PrimaryButton onClick={inputHandler}>Select test input</PrimaryButton>
                    <PrimaryButton onClick={outputHandler}>Select reference output</PrimaryButton>
                    <PrimaryButton onClick={clickHandler}>Start verification</PrimaryButton>
                    <PrimaryButton onClick={cancelHandler}>Cancel</PrimaryButton>
                    <PrimaryButton onClick={() => { setCount(count + 1); }}>Up the counter</PrimaryButton>
                </Stack.Item>
                <Stack.Item>
                    <div hidden={`${result}`== ""} className="ag-theme-balham"
                         style={{height: '200px', width:'600px'}}>
                        <AgGridReact columnDefs={state.columnDefs} rowData={state.rowData}></AgGridReact>
                    </div>
                </Stack.Item>
            </Stack>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));

/*
window.addEventListener('message', (ev) => {
    //ev.data
    console.log(`Got a message from the host ${ev.data}`);
});
*/