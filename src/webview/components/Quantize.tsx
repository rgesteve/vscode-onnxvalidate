import React, { Component } from 'react';
import Header from './Header';
import { Stack, TextField, PrimaryButton, Label, Toggle, ILabelStyles  } from "office-ui-fabric-react";
import { render } from 'react-dom';
import { QuantizeInputParams } from './QuantizeHelper';


interface IStateQuantize {
    inputParams: QuantizeInputParams

}


class Quantize extends Component<{}, IStateQuantize>  {


    state: IStateQuantize;

    constructor(props: any) {
        super(props)
        this.state = {
            inputParams: new QuantizeInputParams()
        }
    }
    componentDidMount() {
        window.addEventListener('message', this.handleWindowListner);
    }

    componentDidUpdate() {

        
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.handleWindowListner);
    }

    handleWindowListner(ev: any) {

    }

    PathToRepresentativeData = () => {
        window.console.log("Select path to representative data");
        // vscode.postMessage({
        //     command: 'setRepresentativeDataPath',
        //     text: 'Select path to representative data'
        // });
        window.console.log(`Sent message to host.`);

    };

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

    toggleShowFields =(event: any) : void=>{
        let myobj=  this.state.inputParams;
        myobj.showFields=event;
        this.setState({inputParams:myobj});
    }
     
   

    render() {
        let { showFields, representativeDataPath } = this.state.inputParams;
        return (
            <div>
                <Stack>
                    <Stack.Item >
                        <Header name={"Quantization Input Parameters"} />
                    </Stack.Item>
                </Stack>
                <Stack tokens={tokens.numericalSpacing}>
                    <Label style={{color:'white'}}>Quantize with representative data? </Label>
                    <Toggle inlineLabel checked={showFields} onChange={(e:any) => {this.toggleShowFields(e)}} />
                    {showFields && (
                        <>
                            <Stack horizontal gap={7}>

                                <Stack.Item grow>
                                    <Label styles={labelStyles}>Path To Representative Data </Label>
                                    <TextField placeholder="Enter path to data" value={representativeDataPath} />
                                </Stack.Item>
                                <Stack.Item align="end" >
                                    <PrimaryButton style={{ width: '200px' }} onClick={this.PathToRepresentativeData} >Select Path to data</PrimaryButton>
                                </Stack.Item>

                            </Stack>
                        </>
                    )}
                    <Stack horizontal tokens={tokens.customSpacing} padding="s1 35%">
                        <Stack.Item>
                            <PrimaryButton style={{ width: '200px' }} onClick={this.clickHandler}>Start Quantization</PrimaryButton>

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

const labelStyles: Partial<ILabelStyles > = {
    
    root: {
        textAlign:'start',
        color:'white'


    }
};


export default Quantize;
