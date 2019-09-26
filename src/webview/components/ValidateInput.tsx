import React, { Component } from 'react';
import Header from './Header';
import { ValidationInputParams } from './ValidationHelper';
import { Dropdown, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import { Stack, TextField, PrimaryButton, Label,ILabelStyles, ITextFieldStyles} from "office-ui-fabric-react";
import { Profileoptions, Backendoptions, DataFormatoptions } from '../constants/Constants';

interface IValidInputProps {
    //variables
    inputProps: ValidationInputParams;

    //eventhandler binds
    formHandler: (e:any, task:String) => void;
    clickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void
    pathToModelHandler: (event: React.MouseEvent<HTMLButtonElement>) => void
    pathToDatasetHandler: (event: React.MouseEvent<HTMLButtonElement>) => void
    cancelHandler: (event: React.MouseEvent<HTMLButtonElement>) => void
}

class ValidateInput extends Component<IValidInputProps, {}> {

    constructor(props: IValidInputProps) {
        super(props);
    }

    render() {
        let {selectedItem, selectedBackend, selectedDataFormat, numberOfImages, modelPath, dataSet} = this.props.inputProps;
        return (
            // TODO: Add different modes accurancy modes. perf mode etc
            //               Add different streams: single stream, multi stream etc
            <Stack tokens={tokens.numericalSpacing}>

                <Stack>
                    <Stack.Item>
                        <Header name={"MLPerf Validation Input Parameters"} />
                    </Stack.Item>

                </Stack>

                <Stack horizontal gap={7} >
                    <Stack.Item grow>
                        <Label styles={labelStyles}>Select a Profile</Label>
                        <Dropdown placeholder="Select a profile" options={Profileoptions} styles={dropdownStyles} selectedKey={selectedItem} onChanged={ (e:any) => {this.props.formHandler(e, "onItemChangedHandler")}} />
                    </Stack.Item>
                    <Stack.Item grow>
                        <Label styles={labelStyles}>Select Backend</Label>
                        <Dropdown placeholder="Select backend" options={Backendoptions} styles={dropdownStyles} selectedKey={selectedBackend} onChanged={ (e:any) => this.props.formHandler(e, "onBackendSelectedHandler") } />
                    </Stack.Item>
                    <Stack.Item grow>
                        <Label styles={labelStyles}>Select data format</Label>
                        <Dropdown placeholder="Select data format" options={DataFormatoptions} styles={dropdownStyles} selectedKey={selectedDataFormat} onChanged={(e:any) => this.props.formHandler(e, "onDataFormatSelectedHandler") } />
                    </Stack.Item>
                    <Stack.Item grow>
                        <Label styles={labelStyles}>Enter count </Label>
                        <TextField placeholder="Enter number of images you need to test from the selected dataset" value={numberOfImages} onChange={(e:any) => this.props.formHandler(e, "onImageCountChangeHandler")} />
                    </Stack.Item>
                </Stack>

                <Stack horizontal gap={5} >
                    <Stack.Item grow>
                        <Label styles={labelStyles}>Enter path to model </Label>
                        <TextField placeholder="Enter path to model" value={modelPath} />
                    </Stack.Item>
                    <Stack.Item align="end" >
                        <PrimaryButton style={{ width: '200px' }} onClick={this.props.pathToModelHandler}>Select Path to model</PrimaryButton>
                    </Stack.Item>
                </Stack>

                <Stack horizontal gap={5} >
                    <Stack.Item grow>
                        <Label styles={labelStyles}>Enter path to data set </Label>
                        <TextField placeholder="Enter path to data set" value={dataSet} />
                    </Stack.Item>
                    <Stack.Item align="end" >
                        <PrimaryButton style={{ width: '200px' }} onClick={this.props.pathToDatasetHandler}>Select Path to dataset</PrimaryButton>
                    </Stack.Item>
                </Stack>

                <Stack horizontal tokens={tokens.customSpacing} padding="s1 35%">
                    <Stack.Item>
                        <PrimaryButton style={{ width: '200px' }} onClick={this.props.clickHandler}>Start Verification</PrimaryButton>
                    </Stack.Item>
                    <Stack.Item >
                        <PrimaryButton style={{ width: '200px' }} onClick={this.props.cancelHandler}>Cancel</PrimaryButton>
                    </Stack.Item>
                </Stack>

            </Stack>
        );
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
    caretDown: { width: 300 },
    root:{
        textAlign:"start"
    }
};
const labelStyles: Partial<ILabelStyles > = {
    
    root: {
        textAlign:'start',
        color:'white'


    }
};



export default ValidateInput;

