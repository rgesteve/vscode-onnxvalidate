import React, { Component } from 'react';
import Header from './Header';
import { Dropdown, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Stack, TextField, PrimaryButton, Label} from "office-ui-fabric-react";
import { Profileoptions, Backendoptions, DataFormatoptions } from '../constants/Constants';

interface IValidInputProps {
    //variables
    count: number,
    modelPath: string,
    dataSet: string,
    selectedItem: string,
    numberOfImages: string,
    selectedBackend: string,
    selectedDataFormat: string

    //eventhandler binds
    onItemChangedHandler: (event: any) => void
    onBackendSelectedHandler: (event: any) => void
    onDataFormatSelectedHandler: (event: any) => void
    onImageCountChangeHandler: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => void
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
        return (
            // TODO: Add different modes accurancy modes. perf mode etc
            //               Add different streams: single stream, multi stream etc
            <Stack tokens={tokens.numericalSpacing}>

                <div>
                    Selected Profile{this.props.selectedItem}
                    Selected backend {this.props.selectedBackend}
                    Data format{this.props.selectedDataFormat}
                    Count{this.props.numberOfImages}
                </div>
                <Stack>
                    <Stack.Item>
                        <Header name={"ONNX Validation Input Parameters"} />
                    </Stack.Item>

                </Stack>

                <Stack horizontal gap={7} >
                    <Stack.Item grow>
                        <Label style={{ color: 'white' }}>Select a Profile</Label>
                        <Dropdown placeholder="Select a profile" options={Profileoptions} styles={dropdownStyles} selectedKey={this.props.selectedItem} onChanged={this.props.onItemChangedHandler} />
                    </Stack.Item>
                    <Stack.Item grow>
                        <Label style={{ color: 'white' }}>Select Backend</Label>
                        <Dropdown placeholder="Select backend" options={Backendoptions} styles={dropdownStyles} selectedKey={this.props.selectedBackend} onChanged={this.props.onBackendSelectedHandler} />
                    </Stack.Item>
                    <Stack.Item grow>
                        <Label style={{ color: 'white' }}>Select data format</Label>
                        <Dropdown placeholder="Select data format" options={DataFormatoptions} styles={dropdownStyles} selectedKey={this.props.selectedDataFormat} onChanged={this.props.onDataFormatSelectedHandler} />
                    </Stack.Item>
                    <Stack.Item grow>
                        <Label style={{ color: 'white' }}>Enter count </Label>
                        <TextField placeholder="Enter number of images you need to test from the selected dataset" value={this.props.numberOfImages} onChange={this.props.onImageCountChangeHandler} />
                    </Stack.Item>
                </Stack>

                <Stack horizontal gap={5} >
                    <Stack.Item grow>
                        <Label style={{ color: 'white' }}>Enter path to model </Label>
                        <TextField placeholder="Enter path to model" value={`${this.props.modelPath}`} />
                    </Stack.Item>
                    <Stack.Item align="end" >
                        <PrimaryButton style={{ width: '200px' }} onClick={this.props.pathToModelHandler}>Select Path to model</PrimaryButton>
                    </Stack.Item>
                </Stack>

                <Stack horizontal gap={5} >
                    <Stack.Item grow>
                        <Label style={{ color: 'white' }}>Enter path to data set </Label>
                        <TextField placeholder="Enter path to data set" value={`${this.props.dataSet}`} />
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
    caretDown: { width: 300 }
};

export default ValidateInput;

