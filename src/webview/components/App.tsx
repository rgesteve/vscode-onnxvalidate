import React, { Component } from 'react';
import { Pivot, PivotItem, PivotLinkFormat, PivotLinkSize, IPivotStyles } from 'office-ui-fabric-react/lib/Pivot';
import Convert from './Convert';
import Quantize from './Quantize';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { ConversionInputParams } from './ConversionHelper';
import { QuantizeInputParams } from './QuantizeHelper';
import ValidateInput from './ValidateInput';
import ValidationResult from './ValidationResult'
import { Result, ValidationInputParams } from './ValidationHelper';

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

interface IState {
    convertInputParams: ConversionInputParams,
    quantizeInputParams: QuantizeInputParams,
    validationResult: Result,
    validationDisplayResult: Boolean,
    validateInputParams: ValidationInputParams


}
class App extends Component<{}, IState> {

    state: IState;
    constructor(props: any) {
        super(props)
        this.state = {
            convertInputParams: new ConversionInputParams(),
            quantizeInputParams: new QuantizeInputParams(),
            validationResult: new Result(),
            validationDisplayResult: false,
            validateInputParams: new ValidationInputParams()
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
                text: this.state.validateInputParams.selectedItem
            }
        );
        window.console.log(`Sent message to host.`);

        console.log("Selecting backend");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setBackend',
                text: this.state.validateInputParams.selectedBackend
            }
        );
        window.console.log(`Sent message to host.`);

        console.log("Selecting data format");
        window.console.log("Testing......");
        vscode.postMessage(
            {
                command: 'setDataFormat',
                text: this.state.validateInputParams.selectedDataFormat
            }
        );

        window.console.log(`Sent message to host.`);

        console.log("Entering number of images from the data set")
        window.console.log("Testing");
        vscode.postMessage(
            {
                command: 'setnumberOfImages',
                text: this.state.validateInputParams.numberOfImages
            }
        );

    }
    componentWillUnmount() {
        window.removeEventListener('message', this.handleWindowListner);
    }

    handleWindowListner(ev: any) {
        let myobj = this.state.validateInputParams;
        switch (ev.data.command) {
            case "modelPath": {
                console.log(`Got a message from the host ${ev.data}`);
                myobj.modelPath = ev.data.payload;
                this.setState(state => ({ validateInputParams: myobj }));
                break;
            }
            case "dataSet": {
                console.log(`Got a message from the host ${ev.data}`);
                myobj.dataSet = ev.data.payload;
                this.setState(state => ({ validateInputParams: myobj }));
                break;
            }
            case "count": {
                console.log(`Got a message from the host ${ev.data}`);
                myobj.count = ev.data.payload;
                this.setState(state => ({ validateInputParams: myobj }));
                break;
            }
            case "selectedItem": {
                console.log(`Got a message from the host ${ev.data}`);
                myobj.selectedItem = ev.data.payload;
                this.setState(state => ({ validateInputParams: myobj }));
                break;
            }
            case "result": {
                window.console.log(`Verification done and result ${this.state.validationResult} `);

                try {
                    console.log(`My payload after verification is ${ev.data.payload}`)
                    let temp: string = ev.data.payload;
                    if (temp.startsWith("DONE")) {
                        let result_string = ev.data.payload.replace("DONE", "");
                        this.setState(state => ({ validationResult: new Result().deserialize(JSON.parse(result_string)) }));
                        this.setState(state => ({ validationDisplayResult: true }));
                    }
                } catch {
                    console.log("Couldn't display keys to the element");
                }
                break;
            }
        }
    }

    PathToRepresentativeData = () => {
        console.log("inside select path to representative data");
        window.console.log("Select path to representative data");
        //  vscode.postMessage({
        //    command: 'setRepresentativeDataPath',
        //     text: 'Select path to representative data'
        //  });
        window.console.log(`Sent message to host.`);

    };

    startQuantization = () => {

        // vscode.postMessage({
        //     command: 'startVerification',
        //     text: 'check out from host',
        // });
        window.console.log(`Sent message to host.`);
    };

    cancelQuantization = () => {
        window.console.log("Select reference output");
        // vscode.postMessage({
        //     command: 'cancel',
        //     text: 'Cancel'
        // });
        window.console.log(`Sent message to host.`);
        //TODO: Add code to clear form fields
    };
    startConversion = () => {

        // vscode.postMessage({
        //     command: 'startVerification',
        //     text: 'check out from host',
        // });
        window.console.log(`Sent message to host.`);
    };

    cancelConversion = () => {
        window.console.log("Select reference output");
        // vscode.postMessage({
        //     command: 'cancel',
        //     text: 'Cancel'
        // });
        window.console.log(`Sent message to host.`);
        //TODO: Add code to clear form fields
    };

    toggleShowFields = (event: any): void => {
        let myobj = this.state.quantizeInputParams;
        myobj.showFields = event;
        this.setState({ quantizeInputParams: myobj });
    }

    formHandler = (event: any, task: String): void => {
        let myobj = this.state.convertInputParams;
        switch (task) {
            case 'onInputNodeChange':
                myobj.inputNode = event.target.value;
                console.log(myobj.inputNode);
                break;
            case 'onOutputNodeChange':
                myobj.outputNode = event.target.value;
                console.log(myobj.outputNode);
                break;
            case 'onOpsetChange':
                myobj.opset = event.target.value;
                console.log(myobj.opset);
                break;
        }
        this.setState({ convertInputParams: myobj });

    }


    validateFormHandler = (event: any, task: String): void => {
        let myobj = this.state.validateInputParams;
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
        this.setState({ validateInputParams: myobj });
    }

    startValidation = () => {
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

    cancelValidation = () => {
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
            <div className="container-header">
                <Pivot styles={pivotStyles} linkFormat={PivotLinkFormat.tabs} linkSize={PivotLinkSize.large}>
                    <PivotItem headerText="Convert">
                        <Label style={{ color: 'white' }}><Convert
                            inputProps={this.state.convertInputParams}
                            formHandler={this.formHandler}
                            startConversion={this.startConversion}
                            cancelConversion={this.cancelConversion}
                        /></Label>
                    </PivotItem>
                    <PivotItem headerText="Quantize">
                        <Label style={{ color: 'white' }}><Quantize
                            inputProps={this.state.quantizeInputParams}
                            startQuantization={this.startConversion}
                            cancelQuantization={this.cancelConversion}
                            PathToRepresentativeData={this.PathToRepresentativeData}
                            toggleShowFields={this.toggleShowFields}
                        /></Label>
                    </PivotItem>
                    <PivotItem headerText="Validate">
                        <Label style={{ color: 'white' }}><ValidateInput
                            inputProps={this.state.validateInputParams}
                            validateFormHandler={this.validateFormHandler}
                            startValidation={this.startValidation}
                            pathToModelHandler={this.pathToModelHandler}
                            pathToDatasetHandler={this.pathToDatasetHandler}
                            cancelValidation={this.cancelValidation}
                        />
                            {this.state.validationDisplayResult == true ? <ValidationResult resultJSON={this.state.validationResult} /> : null}
                        </Label>
                    </PivotItem>
                </Pivot>
            </div>
        );
    }
}

const pivotStyles: Partial<IPivotStyles> = {
    linkContent: {
        fontSize: "20px",
        width: "525px",
    },
    root: {
        lineHeight: "100px"

    }
};
export default App;