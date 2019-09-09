import React from 'react';
import ReactDOM from 'react-dom';
import { initializeIcons } from '@uifabric/icons'


//code added for Dropdown first option

import { IStackTokens } from 'office-ui-fabric-react/lib/Stack';
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Stack, TextField, PrimaryButton, labelProperties, Label, textAreaProperties, BasePeopleSelectedItemsList, } from "office-ui-fabric-react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

initializeIcons();


const App: React.FunctionComponent = () => {

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
        ],
        barData: [
            { 'name': 'Convolution28_fence_before/Conv', 'dur': 6 },
            { 'name': 'Convolution28_kernel_time/Conv', 'dur': 1702 },
            { 'name': 'Convolution28_fence_after/Conv', 'dur': 3 },
            { 'name': 'Plus30_fence_before/Add', 'dur': 3 },
            { 'name': 'Plus30_kernel_time/Add', 'dur': 24 },
            { 'name': 'Plus30_fence_after/Add', 'dur': 2 },
            { 'name': 'ReLU32_fence_before/Relu', 'dur': 3 },
            { 'name': 'ReLU32_kernel_time/Relu', 'dur': 9 },
            { 'name': 'ReLU32_fence_after/Relu', 'dur': 2 },
            { 'name': 'Pooling66_fence_before/MaxPool', 'dur': 2 },
            { 'name': 'Pooling66_kernel_time/MaxPool', 'dur': 31 },
            { 'name': 'Pooling66_fence_after/MaxPool', 'dur': 2 },
            { 'name': 'Convolution110_fence_before/Conv', 'dur': 3 },
            { 'name': 'Convolution110_kernel_time/Conv', 'dur': 123 },
            { 'name': 'Convolution110_fence_after/Conv', 'dur': 2 },
            { 'name': 'Plus112_fence_before/Add', 'dur': 2 },
            { 'name': 'Plus112_kernel_time/Add', 'dur': 13 },
            { 'name': 'Plus112_fence_after/Add', 'dur': 2 },
            { 'name': 'ReLU114_fence_before/Relu', 'dur': 2 },
            { 'name': 'ReLU114_kernel_time/Relu', 'dur': 6 },
            { 'name': 'ReLU114_fence_after/Relu', 'dur': 2 },
            { 'name': 'Pooling160_fence_before/MaxPool', 'dur': 2 },
            { 'name': 'Pooling160_kernel_time/MaxPool', 'dur': 16 },
            { 'name': 'Pooling160_fence_after/MaxPool', 'dur': 2 },
            { 'name': 'Times212_reshape0_fence_before/Reshape', 'dur': 3 },
            { 'name': 'Times212_reshape0_kernel_time/Reshape', 'dur': 4 },
            { 'name': 'Times212_reshape0_fence_after/Reshape', 'dur': 2 },
            { 'name': 'Times212_reshape1_fence_before/Reshape', 'dur': 2 },
            { 'name': 'Times212_reshape1_kernel_time/Reshape', 'dur': 3 },
            { 'name': 'Times212_reshape1_fence_after/Reshape', 'dur': 2 },
            { 'name': 'Times212_fence_before/MatMul', 'dur': 2 },
            { 'name': 'Times212_kernel_time/MatMul', 'dur': 13 },
            { 'name': 'Times212_fence_after/MatMul', 'dur': 2 },
            { 'name': 'Plus214_fence_before/Add', 'dur': 2 },
            { 'name': 'Plus214_kernel_time/Add', 'dur': 19 },
            { 'name': 'Plus214_fence_after/Add', 'dur': 2 }
        ]
    };




    /* const state = {
   
      
          
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
    };*/


    //code added for dropdown
    const dropdownStyles: Partial<IDropdownStyles> = {
        //dropdown: { width: 300}
        caretDown: { width: 300 }

    };



    //TODO: Add other models as needed (takes care of resnet 50 and mobilenet)
    const Profileoptions: IDropdownOption[] = [
        { key: 'Resnet50Header', text: 'Resnet50', itemType: DropdownMenuItemType.Header },
        { key: 'resnet50-tf', text: 'resnet50-tf' },
        { key: 'resnet50-onnxruntime', text: 'resnet50-onnxruntime' },
        { key: 'divider_2', text: '-', itemType: DropdownMenuItemType.Divider },
        { key: 'MobilenetHeader', text: 'MobileNet', itemType: DropdownMenuItemType.Header },
        { key: 'mobilenet-tf', text: 'mobilenet-tf' },
        { key: 'mobilenet-onnxruntime', text: 'mobilenet-onnxruntime' }

    ];

    //TODO: Add other backends as needed
    const Backendoptions: IDropdownOption[] = [
        { key: 'tensorflow', text: 'tensorflow' },
        { key: 'onnxruntime', text: 'onnxruntime' },


    ];

    //TODO: Add other formats as needed
    const DataFormatoptions: IDropdownOption[] = [
        { key: 'NHWC', text: 'NHWC' },
        { key: 'NCHW', text: 'NCHW' },


    ];



    const [count, setCount] = React.useState(0);
    const [modelPath, setModelPath] = React.useState("");
    const [dataSet, setDataset] = React.useState("");
    const [result, setResult] = React.useState([]);
    const [selectedItem, setProfileOption] = React.useState("");
    const [numberOfImages, setnumberOfImages] = React.useState("");
    const [selectedBackend, setBackend] = React.useState("");
    const [selectDataFormat, setDataFormat] = React.useState("");
    React.useEffect(() => {

        window.addEventListener('message', (ev) => {
            switch (ev.data.command) {
                case "modelPath": {
                    console.log(`Got a message from the host ${ev.data}`);
                    setModelPath(ev.data.payload);
                    break;
                }
                case "dataSet": {
                    console.log(`Got a message from the host ${ev.data}`);
                    setDataset(ev.data.payload);
                    break;
                }
                case "count": {
                    console.log(`Got a message from the host ${ev.data}`);
                    setCount(ev.data.payload);
                    break;
                }
                case "selectedItem": {
                    console.log(`Got a message from the host ${ev.data}`);
                    setProfileOption(ev.data.payload);
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
    let PathToModelHandler = () => {
        window.console.log("Select path to model");
        vscode.postMessage({
            command: 'setModelPath',
            text: 'Select path to model'
        });
        window.console.log(`Sent message to host.`);

    };
    let PathToDatasetHandler = () => {
        window.console.log("Select path to data set");
        vscode.postMessage({
            command: 'setDataset',
            text: 'Select path to dataset'
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

    React.useEffect(() => {
        console.log("inside test");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setProfileOption',
                text: selectedItem
            }
        );
        window.console.log(`Sent message to host.`);

        console.log("For backend option");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setBackend',
                text: selectedBackend
            }
        );
        window.console.log(`Sent message to host.`);

        console.log("For data format option");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setDataFormat',
                text: selectDataFormat
            }
        );

        window.console.log(`Sent message to host.`);

        window.console.log("Count entered");
        window.console.log(numberOfImages);
        window.console.log("Testing");
        vscode.postMessage(
            {
                command: 'setnumberOfImages',
                text:numberOfImages
            }
        );


    }, [selectedItem, selectedBackend, selectDataFormat,numberOfImages])

    
    const onItemChanged = React.useCallback(e => setProfileOption(e.text), [setProfileOption]);
    const onBackendSelected = React.useCallback(e => setBackend(e.text), [setBackend]);
    const onDataFormatSelected = React.useCallback(e => setDataFormat(e.text), [setDataFormat]);

    return (

        <div>
            {/* TODO: Add different modes accurancy modes. perf mode etc
                      Add different streams: single stream, multi stream etc */}
            <Stack tokens={tokens.numericalSpacing}>
                <Stack horizontal gap={7} >
                    <Stack.Item grow>
                        <Label style={{ color: 'white' }}>Select a Profile</Label>
                         {/* <Dropdown placeholder="Select a profile" options={Profileoptions} styles={dropdownStyles} selectedKey={selectedItem} onChanged={selectedOption =>{
                        setProfileOption(selectedOption.text); console.log(selectedOption.text);}}  />  */}
                         <Dropdown placeholder="Select a profile" options={Profileoptions} styles={dropdownStyles} selectedKey={selectedItem} onChanged={onItemChanged} /> 
                    </Stack.Item>
                    <Stack.Item grow>
                        <Label style={{ color: 'white' }}>Select Backend</Label>
                        <Dropdown placeholder="Select backend" options={Backendoptions} styles={dropdownStyles} selectedKey={selectedBackend} onChanged={onBackendSelected} />
                    </Stack.Item>
                    <Stack.Item grow>
                        <Label style={{ color: 'white' }}>Select data format</Label>
                        <Dropdown placeholder="Select data format" options={DataFormatoptions} styles={dropdownStyles} selectedKey={selectDataFormat} onChanged={onDataFormatSelected} />
                    </Stack.Item>
                    <Stack.Item grow>
                        <Label style={{ color: 'white' }}>Enter count </Label>
                         <TextField placeholder="Enter number of images you need to test from the selected dataset" value={numberOfImages} onChange={event => { setnumberOfImages((event.target as HTMLInputElement).value)}} /> 
                    </Stack.Item>
                </Stack>

                <Stack horizontal gap={5} >
                    <Stack.Item grow>
                        <Label style={{ color: 'white' }}>Enter path to model </Label>
                        <TextField placeholder="Enter path to model" />
                    </Stack.Item>
                    <Stack.Item align="end" >
                        <PrimaryButton style={{ width: '200px' }} onClick={PathToModelHandler}>Select Path to model</PrimaryButton>
                    </Stack.Item>
                </Stack>
                <Stack horizontal gap={5} >
                    <Stack.Item grow>
                        <Label style={{ color: 'white' }}>Enter path to data set </Label>
                        <TextField placeholder="Enter path to data set" />
                    </Stack.Item>
                    <Stack.Item align="end" >
                        <PrimaryButton style={{ width: '200px' }} onClick={PathToDatasetHandler}>Select Path to dataset</PrimaryButton>
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
            </Stack>

        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));

