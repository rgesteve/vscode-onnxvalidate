import React, {Component} from 'react';
import ValidateInput from './ValidateInput';
import ValidationResult from './ValidationResult'
import Result from './Result';
import { Dropdown, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

interface IValidateState {
    result: Result,
    count: number,
    modelPath: string,
    dataSet: string,
    selectedItem: string,
    numberOfImages: string,
    selectedBackend: string,
    selectedDataFormat: string
}
class Validate extends Component<{}, IValidateState>{

    state: IValidateState;

    constructor(props:any){
        super(props)
        this.state = {
            result: new Result(),
            count: 0,
            modelPath: "",
            dataSet: "",
            selectedItem: "",
            numberOfImages: "",
            selectedBackend: "",
            selectedDataFormat: ""
        }
        this.handleWindowListner = this.handleWindowListner.bind(this);
    }


    componentDidMount(){
        window.addEventListener('message', this.handleWindowListner);
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

    componentWillUnmount() {
        window.removeEventListener('message', this.handleWindowListner);
    }

    handleWindowListner(ev: any) {
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
                    let temp:string = ev.data.payload;
                    console.log(`Poornima: ${temp}`)
                    if( temp.startsWith("DONE") ){
                        let result_string = ev.data.payload.replace("DONE", "");
                        this.setState(state => ({ result: new Result().deserialize(JSON.parse(result_string)) }));
                    }
                } catch {
                    console.log("Couldn't display keys to the element");
                }
                break;
            }
        }
    }

    onItemChangedHandler = (e: any): void => {
        console.log(`Poornima Selected profile ${e.text}`)
        this.setState({ selectedItem: e.text });
    }

    onBackendSelectedHandler = (e: any) => {
        console.log(`Poornima Backend ${e.text}`)
        this.setState({ selectedBackend: e.text });
    }

    onDataFormatSelectedHandler = (e: any) => {
        console.log(`Poornima DataFormat ${e.text}`)
        this.setState({ selectedDataFormat: e.text });
    }

    onImageCountChangeHandler = (e: any) => {
        console.log(`Poornima count ${e.target.value}`)
        this.setState({ numberOfImages: e.target.value });
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

    render(){
        return (
            <div>
                <ValidateInput
                    count={this.state.count}
                    modelPath={this.state.modelPath}
                    dataSet={this.state.dataSet}
                    selectedItem={this.state.selectedItem}
                    numberOfImages={this.state.numberOfImages}
                    selectedBackend={this.state.selectedBackend}
                    selectedDataFormat={this.state.selectedDataFormat}
                    onItemChangedHandler={this.onItemChangedHandler}
                    onBackendSelectedHandler={this.onBackendSelectedHandler}
                    onDataFormatSelectedHandler={this.onDataFormatSelectedHandler}
                    onImageCountChangeHandler={this.onImageCountChangeHandler}
                    clickHandler={this.clickHandler}
                    pathToModelHandler={this.pathToModelHandler}
                    pathToDatasetHandler={this.pathToDatasetHandler}
                    cancelHandler={this.cancelHandler}
                />
                {/* <ValidationResult resultJSON={this.state.result}/>; */}
            </div>
        );
    }
}

export default Validate;