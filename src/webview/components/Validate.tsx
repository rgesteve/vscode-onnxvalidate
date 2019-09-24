import React, { Component } from 'react';
import ValidateInput from './ValidateInput';
import ValidationResult from './ValidationResult'
import { Result, ValidationInputParams } from './ValidationHelper';

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

interface IValidateState {
    result: Result,
    displayResult: Boolean,
    inputParams: ValidationInputParams
}
class Validate extends Component<{}, IValidateState>{

    state: IValidateState;

    constructor(props: any) {
        super(props)
        this.state = {
            result: new Result(),
            displayResult: false,
            inputParams: new ValidationInputParams()
        }
        this.handleWindowListner = this.handleWindowListner.bind(this);
    }

    componentDidMount() {
        window.addEventListener('message', this.handleWindowListner);
    }

    componentDidUpdate() {
        console.log("Selecting profile");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setProfileOption',
                text: this.state.inputParams.selectedItem
            }
        );
        window.console.log(`Sent message to host.`);

        console.log("Selecting backend");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setBackend',
                text: this.state.inputParams.selectedBackend
            }
        );
        window.console.log(`Sent message to host.`);

        console.log("Selecting data format");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setDataFormat',
                text: this.state.inputParams.selectedDataFormat
            }
        );

        window.console.log(`Sent message to host.`);

        console.log("Entering number of images from the data set")
        window.console.log("Testing");
        vscode.postMessage(
            {
                command: 'setnumberOfImages',
                text: this.state.inputParams.numberOfImages
            }
        );
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.handleWindowListner);
    }

    handleWindowListner(ev: any) {
        let myobj = this.state.inputParams;
        switch (ev.data.command) {
            case "modelPath": {
                console.log(`Got a message from the host ${ev.data}`);
                myobj.modelPath = ev.data.payload;
                this.setState(state => ({ inputParams: myobj }));
                break;
            }
            case "dataSet": {
                console.log(`Got a message from the host ${ev.data}`);
                myobj.dataSet = ev.data.payload;
                this.setState(state => ({ inputParams: myobj }));
                break;
            }
            case "count": {
                console.log(`Got a message from the host ${ev.data}`);
                myobj.count = ev.data.payload;
                this.setState(state => ({ inputParams: myobj }));
                break;
            }
            case "selectedItem": {
                console.log(`Got a message from the host ${ev.data}`);
                myobj.selectedItem = ev.data.payload;
                this.setState(state => ({ inputParams: myobj }));
                break;
            }
            case "result": {
                window.console.log(`Verification done and result ${this.state.result} `);

                try {
                    console.log(`My payload after verification is ${ev.data.payload}`)
                    let temp: string = ev.data.payload;
                    if (temp.startsWith("DONE")) {
                        let result_string = ev.data.payload.replace("DONE", "");
                        this.setState(state => ({ result: new Result().deserialize(JSON.parse(result_string)) }));
                        this.setState(state => ({ displayResult: true }));
                    }
                } catch {
                    console.log("Couldn't display keys to the element");
                }
                break;
            }
        }
    }

    formHandler = (event: any, task: String): void => {
        let myobj = this.state.inputParams;
        switch (task) {
            case 'onItemChangedHandler':
                myobj.selectedItem = event.text;
                break;

            case 'onBackendSelectedHandler':
                myobj.selectedBackend = event.text;
                break;

            case 'onDataFormatSelectedHandler':
                myobj.selectedDataFormat = event.text;
                break;

            case "onImageCountChangeHandler":
                myobj.numberOfImages = event.target.value;
                break;
        }
        this.setState({ inputParams: myobj });
    }

    clickHandler = () => {
        vscode.postMessage({
            command: 'startVerification',
            text: 'check out from host',
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
        //TODO: Add code to clear form fields
    };

    render() {
        return (
            <div>
                <ValidateInput
                    inputProps={this.state.inputParams}
                    formHandler={this.formHandler}
                    clickHandler={this.clickHandler}
                    pathToModelHandler={this.pathToModelHandler}
                    pathToDatasetHandler={this.pathToDatasetHandler}
                    cancelHandler={this.cancelHandler}
                />
                {this.state.displayResult == true ? <ValidationResult resultJSON={this.state.result} /> : null}
            </div>
        );
    }
}
export default Validate;