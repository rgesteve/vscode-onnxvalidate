import React, { Component } from 'react';
import { Pivot, PivotItem, PivotLinkFormat, PivotLinkSize, IPivotStyles } from 'office-ui-fabric-react/lib/Pivot';
import Convert from './Convert';
import Quantize from './Quantize';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { ConversionInputParams } from './ConversionHelper';
import { QuantizeInputParams } from './QuantizeHelper';
import ValidateInput from './ValidateInput';
import ValidationResult, { SummarizeResult } from './ValidationResult'
import { Result, ValidationInputParams } from './ValidationHelper';
import { Fabric } from 'office-ui-fabric-react';
const clonedeep = require('lodash.clonedeep')

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

interface IState {
    convertInputParams: ConversionInputParams,
    summarizeResult: string,
    summarizeDisplayResult: Boolean,
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
            summarizeResult: "",
            summarizeDisplayResult: false,
            quantizeInputParams: new QuantizeInputParams(),
            validationResult: new Result(),
            validationDisplayResult: false,
            validateInputParams: new ValidationInputParams()
        }
        this.handleWindowListener = this.handleWindowListener.bind(this);
    }
    componentDidMount() {
        window.addEventListener('message', this.handleWindowListener);

    }

    componentDidUpdate(_prevProps: any, prevState: IState) {

        if (this.state.quantizeInputParams.functionName !== prevState.quantizeInputParams.functionName) {
            vscode.postMessage(
                {
                    command: 'setFunctionName',
                    text: this.state.quantizeInputParams.functionName
                }
            );
            window.console.log(`Sent message to host: setFunctionName ${this.state.quantizeInputParams.functionName}`);
        }
        //update on input validation components
        if (this.state.validateInputParams.selectedItem !== prevState.validateInputParams.selectedItem) {
            vscode.postMessage(
                {
                    command: 'setProfileOption',
                    text: this.state.validateInputParams.selectedItem
                }
            );
            window.console.log(`Sent message to host: setProfileOption ${this.state.validateInputParams.selectedItem}`);
        }

        if (this.state.validateInputParams.selectedBackend !== prevState.validateInputParams.selectedBackend) {
            vscode.postMessage(
                {
                    command: 'setBackend',
                    text: this.state.validateInputParams.selectedBackend
                }
            );
            window.console.log(`Sent message to host: selectedBackend ${this.state.validateInputParams.selectedBackend}`);
        }

        if (this.state.validateInputParams.selectedDataFormat !== prevState.validateInputParams.selectedDataFormat) {
            vscode.postMessage(
                {
                    command: 'setDataFormat',
                    text: this.state.validateInputParams.selectedDataFormat
                }
            );

            window.console.log(`Sent message to host: selectedDataFormat ${this.state.validateInputParams.selectedDataFormat}`);
        }

        if (this.state.validateInputParams.numberOfImages !== prevState.validateInputParams.numberOfImages) {
            vscode.postMessage(
                {
                    command: 'setnumberOfImages',
                    text: this.state.validateInputParams.numberOfImages
                }
            );
            window.console.log(`Sent message to host: setnumberOfImages ${this.state.validateInputParams.numberOfImages}`);
        }
        //update on any convert components 
        if (this.state.convertInputParams.inputNode !== prevState.convertInputParams.inputNode) {
            vscode.postMessage(
                {
                    command: 'setInputNode',
                    text: this.state.convertInputParams.inputNode
                }
            );
            window.console.log(`Sent message to host: setInputNode ${this.state.convertInputParams.inputNode}`);
        }
        if (this.state.convertInputParams.outputNode !== prevState.convertInputParams.outputNode) {
            vscode.postMessage(
                {
                    command: 'setOutputNode',
                    text: this.state.convertInputParams.outputNode
                }
            );
            window.console.log(`Sent message to host: setOutputNode ${this.state.convertInputParams.outputNode}`);
        }
        if (this.state.convertInputParams.opset !== prevState.convertInputParams.opset) {
            vscode.postMessage(
                {
                    command: 'setOpsetNode',
                    text: this.state.convertInputParams.opset
                }
            );
            window.console.log(`Sent message to host: setOpsetNode ${this.state.convertInputParams.opset}`);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.handleWindowListener);
    }

    handleWindowListener(ev: any) {
        let myobj = this.state.validateInputParams;
        let myobjConvert = this.state.convertInputParams;
        let myobjQuantize = this.state.quantizeInputParams;
        switch (ev.data.command) {
            case "modelPathValidate": {
                console.log(`Got a message from the host: modelPathValidate ${ev.data.payload}`);
                myobj.modelPath = ev.data.payload;
                this.setState(state => ({ validateInputParams: myobj }));
                break;
            }
            case "modelPathConvert": {
                console.log(`Convert: Got a message from the host modelPathConvert ${ev.data.payload}`);
                myobjConvert.modelPath = ev.data.payload;
                this.setState(state => ({ convertInputParams: myobjConvert }));
                break;
            }
            case "modelPathQuantize": {
                console.log(`Quantize: Got a message from the host modelPathQuantize ${ev.data.payload}`);
                myobjQuantize.modelPath = ev.data.payload;
                this.setState(state => ({ quantizeInputParams: myobjQuantize }));
                break;
            }
            case "preprocessModulePath": {
                console.log(`Quantize: Got a message from the host preprocessModulePath ${ev.data.payload}`);
                myobjQuantize.preprocessModulePath = ev.data.payload;
                this.setState(state => ({ quantizeInputParams: myobjQuantize }));
                break;
            }

            case "datasetValidate": {
                console.log(`Got a message from the host datasetValidate ${ev.data.payload}`);
                myobj.datasetPath = ev.data.payload;
                this.setState(state => ({ validateInputParams: myobj }));
                break;
            }
            case "datasetQuantize": {
                console.log(`Got a message from the host datasetQuantize ${ev.data.payload}`);
                myobjQuantize.datasetPath = ev.data.payload;
                this.setState(state => ({ quantizeInputParams: myobjQuantize }));
                break;
            }

            case "selectedItem": {
                console.log(`Got a message from the host ${ev.data.payload}`);
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
            case "summarizeResult": {
                window.console.log(`Summarize result ${this.state.summarizeResult} `);

                try {
                    console.log(`My payload after summarization is ${ev.data.payload}`)
                    let temp: string = ev.data.payload;
                    if (temp) {
                        this.setState(state => ({ summarizeResult: temp }));
                        this.setState(state => ({ summarizeDisplayResult: true }));
                    }
                } catch {
                    console.log("Couldn't display summarize result");
                }
                break;
            }
            case "clearValidationForm": {
                console.log(`Got a message from the host : clearValidationForm`);

                myobj.selectedItem = "";
                myobj.selectedDataFormat = "";
                myobj.numberOfImages = "";
                myobj.modelPath = "";
                myobj.datasetPath = "";
                myobj.count = 0;

                this.setState(state => ({ validateInputParams: myobj }));
                break;
            }

            case "clearConversionForm": {
                console.log(`Got a message from the host : clearConversionForm`);

                myobjConvert.inputNode = "";
                myobjConvert.modelPath = "";
                myobjConvert.opset = "";
                myobjConvert.outputNode = "";

                this.setState(state => ({ convertInputParams: myobjConvert }));
                break;
            }

            case "clearQuantizationForm": {
                console.log(`Got a message from the host : clearQuantizationForm`);

                myobjQuantize.datasetPath = "";
                myobjQuantize.functionName = "";
                myobjQuantize.modelPath = "";
                myobjQuantize.preprocessModulePath = "";

                this.setState(state => ({ quantizeInputParams: myobjQuantize }));
                break;
            }
        }
    }

    PathToRepresentativeData = () => {
        vscode.postMessage({
            command: 'setDataset:quantize',
            text: 'Select path to representative data'
        });
        window.console.log(`Sent message to host: setDataset:quantize`);

    };

    pathToModelQuantize = () => {
        vscode.postMessage({
            command: 'setModelPath:quantize',
            text: 'Select path to model'
        });
        window.console.log(`Sent message to host: setModelPath:quantize`);
    };


    pathToPreprocessModule = () => {
        window.console.log("Select path to preprocess module");
        vscode.postMessage({
            command: 'setPreprocessModulePath',
            text: 'Select path to preprocess module path'
        });
        window.console.log(`Sent message to host: setPreprocessModulePath`);
    };
    startQuantization = () => {
        vscode.postMessage({
            command: 'startQuantization',
            text: 'start process of quantization',
        });
        window.console.log(`Sent message to host: startQuantization`);
    };

    cancelQuantization = () => {
        vscode.postMessage({
            command: 'cancelQuantization',
            text: 'Cancel'
        });
        window.console.log(`Sent message to host: cancelQuantization`);
    };

    pathToModelConvert = () => {
        window.console.log("Select path to model");
        vscode.postMessage({
            command: 'setModelPath:convert',
            text: 'Select path to model'
        });
        window.console.log(`Sent message to host: setModelPath:convert`);
    };
    summarizeGraph = () => {

        vscode.postMessage({
            command: 'summarizeGraph',
            text: 'summarize graph',
        });
        window.console.log(`Sent message to host: summarizeGraph`);
    };
    startConversion = () => {

        vscode.postMessage({
            command: 'startConversion',
            text: 'start process of conversion',
        });
        window.console.log(`Sent message to host: startConversion`);
    };

    cancelConversion = () => {

        vscode.postMessage({
            command: 'cancelConversion',
            text: 'Cancel'
        });
        window.console.log(`Sent message to host: cancelConversion`);
    };


    formHandler = (event: any, task: String): void => {
        const deepcloned = clonedeep(this.state.convertInputParams);
        switch (task) {
            case 'onInputNodeChange':
                deepcloned.inputNode = event.target.value;
                break;
            case 'onOutputNodeChange':
                deepcloned.outputNode = event.target.value;
                break;
            case 'onOpsetChange':
                deepcloned.opset = event.target.value;
                break;
        }
        console.log("Setting state convertInputParams");
        this.setState({ convertInputParams: deepcloned });

    }

    quantizeFormHandler = (event: any, task: String): void => {
        const deepcloned = clonedeep(this.state.quantizeInputParams);
        switch (task) {
            case 'onFunctionNameChange':
                deepcloned.functionName = event.target.value;
                break;
        }
        console.log("Setting state quantizeInputParams");
        this.setState({ quantizeInputParams: deepcloned });

    }

    validateFormHandler = (event: any, task: String): void => {
        const deepcloned = clonedeep(this.state.validateInputParams);
        switch (task) {
            case 'onItemChangedHandler':
                deepcloned.selectedItem = event.text;
                break;

            case 'onBackendSelectedHandler':
                deepcloned.selectedBackend = event.text;
                break;

            case 'onDataFormatSelectedHandler':
                deepcloned.selectedDataFormat = event.text;
                break;

            case "onImageCountChangeHandler":
                deepcloned.numberOfImages = event.target.value;
                break;
        }
        console.log("Setting state validateInputParams");
        this.setState({ validateInputParams: deepcloned });
    }

    startValidation = () => {
        vscode.postMessage({
            command: 'startVerification',
        });
        window.console.log(`Sent message to host: startValidation`);
    };

    pathToModelValidate = () => {
        vscode.postMessage({
            command: 'setModelPath:validate',
            text: 'Select path to model'
        });
        window.console.log(`Sent message to host: pathToModelValidate`);
    };

    pathToDatasetHandler = () => {
        vscode.postMessage({
            command: 'setDataset:validate',
            text: 'Select path to dataset'
        });
        window.console.log(`Sent message to host: pathToDatasetHandler`);
    };

    cancelValidation = () => {
        vscode.postMessage({
            command: 'cancelValidation',
        });
        window.console.log(`Sent message to host: cancelValidation`);
    };


    downloadResult = () => {
        vscode.postMessage({
            command: 'downloadResult',
            text: 'Download Result',
        });
        window.console.log(`Sent message to host: downloadResult`);
    };
    render() {

        return (
            <Fabric className="container-header">


                <Pivot styles={pivotStyles} linkFormat={PivotLinkFormat.tabs} linkSize={PivotLinkSize.large}>
                    <PivotItem headerText="Convert">
                        <Label style={{ color: 'white' }}><Convert
                            inputProps={this.state.convertInputParams}
                            pathToModel={this.pathToModelConvert}
                            formHandler={this.formHandler}
                            summarizeGraph={this.summarizeGraph}
                            startConversion={this.startConversion}
                            cancelConversion={this.cancelConversion}
                        />
                            {this.state.summarizeDisplayResult == true ? <SummarizeResult summarizeResult={this.state.summarizeResult} /> : null}
                        </Label>
                    </PivotItem>
                    <PivotItem headerText="Quantize">
                        <Label style={{ color: 'white' }}><Quantize
                            inputProps={this.state.quantizeInputParams}
                            pathToModel={this.pathToModelQuantize}
                            pathToPreprocessModule={this.pathToPreprocessModule}
                            quantizeFormHandler={this.quantizeFormHandler}
                            startQuantization={this.startQuantization}
                            cancelQuantization={this.cancelQuantization}
                            pathToRepresentativeData={this.PathToRepresentativeData}
                        /></Label>
                    </PivotItem>
                    <PivotItem headerText="Validate">
                        <Label style={{ color: 'white' }}><ValidateInput
                            inputProps={this.state.validateInputParams}
                            validateFormHandler={this.validateFormHandler}
                            startValidation={this.startValidation}
                            pathToModelHandler={this.pathToModelValidate}
                            pathToDatasetHandler={this.pathToDatasetHandler}
                            cancelValidation={this.cancelValidation} />
                            {this.state.validationDisplayResult == true ?
                                <ValidationResult resultJSON={this.state.validationResult} downloadHandler={this.downloadResult} /> : null}
                        </Label>
                    </PivotItem>
                </Pivot>
            </Fabric>
        );
    }
}

const pivotStyles: Partial<IPivotStyles> = {
    root: { marginTop: 10 }
};


// const pivotStyles: Partial<IPivotStyles> = {
//     linkContent: {
//         fontSize: "20px",
//         width: "525px",
//     },
//     root: {
//         lineHeight: "100px//     }
// };
export default App;