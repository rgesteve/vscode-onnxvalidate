import React from 'react';
import ReactDOM from 'react-dom';

import { Stack, TextField, PrimaryButton } from "office-ui-fabric-react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

declare var acquireVsCodeApi : any;
const vscode = acquireVsCodeApi();

const App = () => {

    const tokens = {
        fiveGapStack : {
            childrenGap : 5
        }
    };

    const state = {
        columnDefs : [
            {headerName : 'Make',  field : 'make'},
            {headerName : 'Model', field : 'model'},
            {headerName : 'Price', field : 'price'},
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

    let objectsInVSCode = Object.keys(vscode).join(',');

    let clickHandler = () => {
        /*
        React.useEffect(() => {
            setCount(count + 1);
        });
        */

        window.console.log(`Curious to see where ${count} value is.`);
        vscode.postMessage({
            command : 'setInputFile',
            text: 'check out from host'
        });
        window.console.log(`Sent message to host.`);

    };

    return (
        // todo -- connect with a file-picker (directory and file) and kick off verification
        <div>
            <Stack tokens={tokens.fiveGapStack}>
                <Stack.Item align="stretch">
                    <span>Enter directory containing inputs</span>
                    <TextField value= { `The count should be ${count} here...`} placeholder="Inputs..." />
                    <span>Enter file containing validation</span>
                    <TextField value={`Properties of vscode API are ${Object.keys(vscode).join(',')} .`} placeholder="Reference outputs..." />
                </Stack.Item>
                <Stack.Item align="center">
                    <PrimaryButton onClick={clickHandler}>Start verification</PrimaryButton>
                </Stack.Item>
                <Stack.Item>
                    <div className="ag-theme-balham"
                         style={{height: '200px', width:'600px'}}>
                        <AgGridReact columnDefs={state.columnDefs} rowData={state.rowData}></AgGridReact>
                    </div>
                </Stack.Item>
            </Stack>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));