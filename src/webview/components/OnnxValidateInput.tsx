import React from 'react';
import Header from './Header';
import OnnxDisplayResult from './OnnxDisplayResult';
import { Dropdown, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import { Stack, TextField, PrimaryButton, Label, Spinner} from "office-ui-fabric-react";
//initializeIcons();
declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

const OnnxValidateInput: React.FunctionComponent = () => {

    const tokens = {
        numericalSpacing: {
            childrenGap: 10
        },
        customSpacing: {
            childrenGap: '10'
        },
    };

    //code added for dropdown
    const dropdownStyles: Partial<IDropdownStyles> = {
        //dropdown: { width: 300}
        caretDown: { width: 300 }
    };

    const [count, setCount] = React.useState(0);
    const [modelPath, setModelPath] = React.useState("");
    const [dataSet, setDataset] = React.useState("");
    const [result, setResult] = React.useState("");
    const [selectedItem, setProfileOption] = React.useState("");
    const [numberOfImages, setnumberOfImages] = React.useState("");
    const [selectedBackend, setBackend] = React.useState("");
    const [selectDataFormat, setDataFormat] = React.useState("");

    const onItemChanged = React.useCallback(e => setProfileOption(e.text), [setProfileOption]);
    const onBackendSelected = React.useCallback(e => setBackend(e.text), [setBackend]);
    const onDataFormatSelected = React.useCallback(e => setDataFormat(e.text), [setDataFormat]);

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
                    console.log(`Verification done `);

                    try {
                        //console.log(`Got object that looks like: ${ev.data}.`);
                        //let table : Array<any> = Array.from(ev.data.payload);
                        //console.log(`Found ${table.length} records in data.`);
                        //setResult(ev.data.payload);
                        console.log(`My payload after verification is ${ev.data.payload}`)
                        setResult(ev.data.payload);
                    } catch {
                        console.log("Couldn't display keys to the element");
                    }
                    break;
                }
            }
        });
    }, []);

    React.useEffect(() => {
        console.log("Selecting profile");
        window.console.log(selectedItem);
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setProfileOption',
                text: selectedItem
            }
        );
        window.console.log(`Sent message to host.`);

        console.log("Selecting backend");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setBackend',
                text: selectedBackend
            }
        );
        window.console.log(`Sent message to host.`);

        console.log("Selecting data format");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setDataFormat',
                text: selectDataFormat
            }
        );

        window.console.log(`Sent message to host.`);

        console.log("Entering number of images from the data set")
        window.console.log("Testing");
        vscode.postMessage(
            {
                command: 'setnumberOfImages',
                text: numberOfImages
            }
        );


    }, [selectedItem, selectedBackend, selectDataFormat, numberOfImages])

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

    switch (result.split(' ')[0]) {
        case 'FAILED':
            return <div>Verification Failed</div>;

        case 'DONE':
            return <OnnxDisplayResult resultJSON = {result.replace("DONE", "")}/>;

        case 'IN_PROGRESS':
            return (
                <Stack verticalFill gap='15'>
                    <Stack.Item>
                        <Header name={"ONNX VALIDATION"} />
                    </Stack.Item>

                    <Stack.Item>
                        <Spinner label="ONNX Validation in Progress" />
                    </Stack.Item>
                </Stack>
            );

        default:
            return (
                    // TODO: Add different modes accurancy modes. perf mode etc
                    //               Add different streams: single stream, multi stream etc
                    <Stack tokens={tokens.numericalSpacing}>
                        <Stack>
                            <Stack.Item >
                                <Header name={"MLPerf Validation Input Parameters"} />
                            </Stack.Item>

                        </Stack>

                        <Stack horizontal gap={7} >
                            <Stack.Item grow>
                                <Label style={{ color: 'white' }}>Select a Profile</Label>
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
                                <TextField placeholder="Enter number of images you need to test from the selected dataset" value={numberOfImages} onChange={event => { setnumberOfImages((event.target as HTMLInputElement).value) }} />
                            </Stack.Item>
                        </Stack>

                        <Stack horizontal gap={5} >
                            <Stack.Item grow>
                                <Label style={{ color: 'white' }}>Enter path to model </Label>
                                <TextField placeholder="Enter path to model" value={`${modelPath}`} />
                            </Stack.Item>
                            <Stack.Item align="end" >
                                <PrimaryButton style={{ width: '200px' }} onClick={PathToModelHandler}>Select Path to model</PrimaryButton>
                            </Stack.Item>
                        </Stack>

                        <Stack horizontal gap={5} >
                            <Stack.Item grow>
                                <Label style={{ color: 'white' }}>Enter path to data set </Label>
                                <TextField placeholder="Enter path to data set" value={`${dataSet}`} />
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


            );
    }

};

export default OnnxValidateInput;

