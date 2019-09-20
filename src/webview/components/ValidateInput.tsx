import React, { Component } from 'react';
import Header from './Header';
import OnnxDisplayResult from './OnnxDisplayResult';
import { Dropdown, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import { Stack, TextField, PrimaryButton, Label, Spinner } from "office-ui-fabric-react";
import { Profileoptions, Backendoptions, DataFormatoptions } from '../constants/Constants';
//initializeIcons();
declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();


type ValidInputState = {
    count: number,
    modelPath: string,
    dataSet: string,
    result: string,
    selectedItem: string,
    numberOfImages: string,
    selectedBackend: string,
    selectedDataFormat: string
}

class ValidateInput extends Component<{}, ValidInputState> {

    constructor(props: any) {
        super(props);
        this.state = {
            count: 0,
            modelPath: "",
            dataSet: "",
            result: "",
            selectedItem: "",
            numberOfImages: "",
            selectedBackend: "",
            selectedDataFormat: ""
        }
        this.handleWindowListner = this.handleWindowListner.bind(this);
    }

    handleWindowListner(ev:any) {
        switch (ev.data.command) {
            case "modelPath": {
                console.log(`Got a message from the host ${ev.data}`);
                this.setState(state => ({ modelPath: ev.data.payload }));
                break;
            }
            case "dataSet": {
                console.log(`Got a message from the host ${ev.data}`);
                this.setState(state => ({ dataSet: ev.data.payload }));
                break;
            }
            case "count": {
                console.log(`Got a message from the host ${ev.data}`);
                this.setState(state => ({ count: ev.data.payload }));
                break;
            }
            case "selectedItem": {
                console.log(`Got a message from the host ${ev.data}`);
                this.setState(state => ({ selectedItem: ev.data.payload }));
                break;
            }
            case "result": {
                window.console.log(`Verification done and result ${this.state.result} `);

                try {
                    console.log(`My payload after verification is ${ev.data.payload}`)
                    this.setState(state => ({ result: ev.data.payload }));
                } catch {
                    console.log("Couldn't display keys to the element");
                }
                break;
            }
        }
    }

    componentDidMount() {
        window.addEventListener('message', this.handleWindowListner);
    }

    componentWillUnmount(){
        window.removeEventListener('message', this.handleWindowListner);
    }

    componentDidUpdate() {
        console.log("Selecting profile");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setProfileOption',
                text: this.state.selectedItem
            }
        );
        window.console.log(`Sent message to host.`);

        console.log("Selecting backend");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setBackend',
                text: this.state.selectedBackend
            }
        );
        window.console.log(`Sent message to host.`);

        console.log("Selecting data format");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setDataFormat',
                text: this.state.selectedDataFormat
            }
        );

        window.console.log(`Sent message to host.`);

        console.log("Entering number of images from the data set")
        window.console.log("Testing");
        vscode.postMessage(
            {
                command: 'setnumberOfImages',
                text: this.state.numberOfImages
            }
        );
    }

    onItemChangedHandler = (e:any) => {
        this.setState({ selectedItem: e.text });
    }

    onBackendSelectedHandler = (e: any) => {
        this.setState( { selectedBackend: e.text } );
    }

    onDataFormatSelectedHandler = (e:any) => {
        this.setState( { selectedDataFormat: e.text });
    }

    onImageCountChangeHandler = (e:any) => {
        this.setState( {numberOfImages: e.target.value});
    }

    clickHandler = () => {
        window.console.log(`Curious to see where ${this.state.count} value is.`);
        vscode.postMessage({
            command: 'startVerification',
            text: 'check out from host'
        });
        window.console.log(`Sent message to host.`);
    };

    pathToModelHandler = () => {
        window.console.log("Select path to model");
        vscode.postMessage({
            command: 'setModelPath',
            text: 'Select path to model'
        });
        window.console.log(`Sent message to host.`);
    };

    pathToDatasetHandler = () => {
        window.console.log("Select path to data set");
        vscode.postMessage({
            command: 'setDataset',
            text: 'Select path to dataset'
        });
        window.console.log(`Sent message to host.`);
    };

    cancelHandler = () => {
        window.console.log("Select reference output");
        vscode.postMessage({
            command: 'cancel',
            text: 'Cancel'
        });
        window.console.log(`Sent message to host.`);
    };

    render() {

        switch (this.state.result.split(' ')[0]) {
            case 'FAILED':
                return <div>Verification Failed</div>;

            case 'DONE':
                return <OnnxDisplayResult resultJSON = {this.state.result.replace("DONE", "")}/>;

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
                                <Stack.Item>
                                    <Header name={"ONNX Validation Input Parameters"} />
                                </Stack.Item>

                            </Stack>

                            <Stack horizontal gap={7} >
                                <Stack.Item grow>
                                    <Label style={{ color: 'white' }}>Select a Profile</Label>
                                    <Dropdown placeholder="Select a profile" options={Profileoptions} styles={dropdownStyles} selectedKey={this.state.selectedItem} onChanged={this.onItemChangedHandler} />
                                </Stack.Item>
                                <Stack.Item grow>
                                    <Label style={{ color: 'white' }}>Select Backend</Label>
                                    <Dropdown placeholder="Select backend" options={Backendoptions} styles={dropdownStyles} selectedKey={this.state.selectedBackend} onChanged={this.onBackendSelectedHandler} />
                                </Stack.Item>
                                <Stack.Item grow>
                                    <Label style={{ color: 'white' }}>Select data format</Label>
                                    <Dropdown placeholder="Select data format" options={DataFormatoptions} styles={dropdownStyles} selectedKey={this.state.selectedDataFormat} onChanged={this.onDataFormatSelectedHandler} />
                                </Stack.Item>
                                <Stack.Item grow>
                                    <Label style={{ color: 'white' }}>Enter count </Label>
                                    <TextField placeholder="Enter number of images you need to test from the selected dataset" value={this.state.numberOfImages} onChange={this.onImageCountChangeHandler} />
                                </Stack.Item>
                            </Stack>

                            <Stack horizontal gap={5} >
                                <Stack.Item grow>
                                    <Label style={{ color: 'white' }}>Enter path to model </Label>
                                    <TextField placeholder="Enter path to model" value={`${this.state.modelPath}`} />
                                </Stack.Item>
                                <Stack.Item align="end" >
                                    <PrimaryButton style={{ width: '200px' }} onClick={this.pathToModelHandler}>Select Path to model</PrimaryButton>
                                </Stack.Item>
                            </Stack>

                            <Stack horizontal gap={5} >
                                <Stack.Item grow>
                                    <Label style={{ color: 'white' }}>Enter path to data set </Label>
                                    <TextField placeholder="Enter path to data set" value={`${this.state.dataSet}`} />
                                </Stack.Item>
                                <Stack.Item align="end" >
                                    <PrimaryButton style={{ width: '200px' }} onClick={this.pathToDatasetHandler}>Select Path to dataset</PrimaryButton>
                                </Stack.Item>
                            </Stack>

                            <Stack horizontal tokens={tokens.customSpacing} padding="s1 35%">
                                <Stack.Item>
                                    <PrimaryButton style={{ width: '200px' }} onClick={this.clickHandler}>Start Verification</PrimaryButton>

                                </Stack.Item>
                                <Stack.Item >

                                    <PrimaryButton style={{ width: '200px' }} onClick={this.cancelHandler}>Cancel</PrimaryButton>
                                </Stack.Item>
                            </Stack>

                        </Stack>
                );
        }
    }

};

const tokens = {
    numericalSpacing: {
        childrenGap: 10
    },
    customSpacing: {
        childrenGap: '10'
    },
};

const dropdownStyles: Partial<IDropdownStyles> = {
    caretDown: { width: 300 }
};

export default ValidateInput;

