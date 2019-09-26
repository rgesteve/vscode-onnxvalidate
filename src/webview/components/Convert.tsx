import React, { Component } from 'react';
import Header from './Header';
import { Stack, TextField, PrimaryButton, Label, Spinner } from "office-ui-fabric-react";
import { ConversionInputParams } from './ConversionHelper';

interface IConvertState {
    inputParams: ConversionInputParams;

}

class Convert extends Component<{}, IConvertState>{

    state: IConvertState;

    constructor(props: any) {
        super(props)
        this.state = {
            inputParams: new ConversionInputParams()
        }
        this.handleWindowListner = this.handleWindowListner.bind(this);
    }

    componentDidMount() {
        window.addEventListener('message', this.handleWindowListner);
    }


    componentDidUpdate() {
        console.log("Getting input node");
        window.console.log("Testing......");
        // vscode.postMessage(
        //     {
        //         command: 'setInputNode',
        //         text: inputNode
        //     }
        // );
        window.console.log(`Sent message to host.`);

        console.log("Getting output node");

        window.console.log("Testing......");
        // vscode.postMessage(
        //     {
        //         command: 'setOutputNode',
        //         text: outputNode
        //     }
        // );
        window.console.log(`Sent message to host.`);

        console.log("Getting opset node");

        window.console.log("Testing......");
        // vscode.postMessage(
        //     {
        //         command: 'setOutputNode',
        //         text: outputNode
        //     }
        // );
        window.console.log(`Sent message to host.`);



    }
    componentWillUnmount() {
        window.removeEventListener('message', this.handleWindowListner);
    }

    handleWindowListner(ev: any) {


    }

    clickHandler = () => {

        // vscode.postMessage({
        //     command: 'startVerification',
        //     text: 'check out from host',
        // });
        window.console.log(`Sent message to host.`);
    };

    cancelHandler = () => {
        window.console.log("Select reference output");
        // vscode.postMessage({
        //     command: 'cancel',
        //     text: 'Cancel'
        // });
        window.console.log(`Sent message to host.`);
        //TODO: Add code to clear form fields
    };

    formHandler = (event: any, task: String): void => {
        let myobj = this.state.inputParams;
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
        this.setState({ inputParams: myobj });

    }

    render() {
        let { inputNode, outputNode, opset } = this.state.inputParams
        return (
            <div>
                <Stack>
                    <Stack.Item >
                        <Header name={"Conversion Input Parameters"} />
                    </Stack.Item>
                </Stack>
                <Stack tokens={tokens.numericalSpacing}>
                    <Stack horizontal gap={7}>
                        <Stack.Item grow>
                            <Label style={{ color: 'white' }}>Enter Input node </Label>
                            <TextField placeholder="Enter Input node" value={inputNode} onChange={(e: any) => this.formHandler(e, "onInputNodeChange")} />
                        </Stack.Item>
                        <Stack.Item grow>
                            <Label style={{ color: 'white' }}>Enter Output node </Label>
                            <TextField placeholder="Enter Output node" value={outputNode} onChange={(e: any) => this.formHandler(e, "onOutputNodeChange")} />
                        </Stack.Item>
                        <Stack.Item grow>
                            <Label style={{ color: 'white' }}>Enter opset </Label>
                            <TextField placeholder="Default value is 8" value={opset} onChange={(e: any) => this.formHandler(e, "onOpsetChange")} />
                        </Stack.Item>
                    </Stack>

                    <Stack horizontal tokens={tokens.customSpacing} padding="s1 35%">
                        <Stack.Item>
                            <PrimaryButton style={{ width: '200px' }} onClick={this.clickHandler}>Start Conversion</PrimaryButton>

                        </Stack.Item>
                        <Stack.Item >

                            <PrimaryButton style={{ width: '200px' }} onClick={this.cancelHandler}>Cancel</PrimaryButton>
                        </Stack.Item>
                    </Stack>
                </Stack>
            </div>

        );
    }
}

const tokens = {
    numericalSpacing: {
        childrenGap: 10
    },
    customSpacing: {
        childrenGap: '10'
    },
};
export default Convert;
