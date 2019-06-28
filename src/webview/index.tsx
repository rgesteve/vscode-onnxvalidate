import React from 'react';
import ReactDOM from 'react-dom';

import { Stack, TextField, PrimaryButton } from "office-ui-fabric-react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

const App: React.SFC = () => {

    const divStyle = {
        height: '600px', width: '800px'
    };

    const tokens = {

        numericalSpacing: {
            childrenGap: 10
        },
        customSpacing: {
            childrenGap: '10'
        },
    };

    const state = {
        columnDefs: [
            { headerName: 'Inputs', field: 'input' },
            { headerName: 'Actual', field: 'actual' },
            { headerName: 'Predicted', field: 'expected' },
        ],
        rowData: [{ "input": "Toyota", "actual": "Celica", "expected": 35000 },
        { "input": "Ford", "actual": "Mondeo", "expected": 32000 },
        { "input": "Porsche", "actual": "Boxter", "expected": 72000 },
        { "input": "Toyota", "actual": "Celica", "expected": 35000 },
        { "input": "Ford", "actual": "Mondeo", "expected": 32000 },
        { "input": "Porsche", "actual": "Boxter", "expected": 72000 },
        { "input": "Toyota", "actual": "Celica", "expected": 35000 },
        { "input": "Ford", "actual": "Mondeo", "expected": 32000 },
        { "input": "Porsche", "actual": "Boxter", "expected": 72000 },
        { "input": "Toyota", "actual": "Celica", "expected": 35000 },
        ]
    };

    const [count, setCount] = React.useState(0);
    const [inputFile, setInputFile] = React.useState("");
    const [outputFile, setOutputFile] = React.useState("");
    const [result, setResult] = React.useState([]);

    React.useEffect(() => {
        window.addEventListener('message', (ev) => {
            switch (ev.data.command) {
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
                    console.log(`Got a message from the host ${ev.data}, of type: ${typeof (ev.data)}.`);
                    try {
                        //console.log(`Got object that looks like: ${ev.data}.`);
                        //let table : Array<any> = Array.from(ev.data.payload);
                        //console.log(`Found ${table.length} records in data.`);
                        setResult(ev.data.payload);
                    } catch {
                        console.log("Couldn't display keys to the element");
                    }
                    break;
                }
            }
        });
    }, []);

    let clickHandler = () => {
        window.console.log(`Curious to see where ${count} value is.`);
        vscode.postMessage({
            command: 'startVerification',
            text: 'check out from host'
        });
        window.console.log(`Sent message to host.`);

    };
    let inputHandler = () => {
        window.console.log("Select test input");
        vscode.postMessage({
            command: 'setInputFile',
            text: 'Select test input'
        });
        window.console.log(`Sent message to host.`);

    };
    let outputHandler = () => {
        window.console.log("Select reference output");
        vscode.postMessage({
            command: 'setOutputFile',
            text: 'Select reference output'
        });
        window.console.log(`Sent message to host.`);

    };

    let cancelHandler = () => {
        window.console.log("Select reference output");
        vscode.postMessage({
            command: 'cancel',
            text: 'Cancel'
        });
        window.console.log(`Sent message to host.`);

    };

    return (

        <div>
            <Stack tokens={tokens.numericalSpacing}>
                <Stack horizontal gap={3} >
                    <Stack.Item grow >
                        <span>Enter directory containing inputs</span>
                        <TextField value={`${inputFile}`} placeholder="Inputs..." />
                    </Stack.Item>
                    <Stack.Item align="end" >
                        <PrimaryButton style={{ width: '200px' }} onClick={inputHandler}>Select Test Input</PrimaryButton>
                    </Stack.Item>

                </Stack>

                <Stack horizontal gap={3}>
                    <Stack.Item grow >
                        <span>Enter file containing validation</span>
                        <TextField value={`${outputFile}`} placeholder="Reference outputs..." />
                    </Stack.Item>

                    <Stack.Item align="end" >
                        <PrimaryButton style={{ width: '200px' }} onClick={outputHandler}>Select Reference Output</PrimaryButton>
                    </Stack.Item>
                </Stack>

                <Stack horizontal tokens={tokens.customSpacing} padding="s1 35%">
                    <Stack.Item>
                        <PrimaryButton style={{ width: '200px' }} onClick={clickHandler}>Start Verification</PrimaryButton>
                    </Stack.Item>
                    <Stack.Item >
                        <PrimaryButton style={{ width: '200px' }} onClick={cancelHandler}>Cancel</PrimaryButton>
                    </Stack.Item>
                </Stack>

                <Stack>
                    <Stack.Item>
                        <span hidden={result.length === 0}>Validation Result</span>
                        <div className="ag-theme-balham" style={{ height: '600px', width: '1200px' }} hidden={result.length === 0}>
                            <AgGridReact columnDefs={state.columnDefs} rowData={result}></AgGridReact>
                        </div>
                    </Stack.Item>
                </Stack>

            </Stack>




        </div>



    );
};

ReactDOM.render(<App />, document.getElementById('root'));
