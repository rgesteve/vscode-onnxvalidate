import React, { Component } from 'react';
import Header from './Header';
import { Stack, TextField, PrimaryButton, Label, Toggle, ILabelStyles, IToggleStyles } from "office-ui-fabric-react";
import { QuantizeInputParams } from './QuantizeHelper';
import { func } from 'prop-types';

interface IState {

    showFields: boolean | undefined
}

interface IQuantizeProps {
    inputProps: QuantizeInputParams;
    quantizeFormHandler: (e: any, task: String) => void;
    datasetquantizeFormHandler: (e: any, task: String) => void;
    pathToModel: (event: React.MouseEvent<HTMLButtonElement>) => void
    pathToPreprocessModule: (event: React.MouseEvent<HTMLButtonElement>) => void
    pathToRepresentativeData: (event: React.MouseEvent<HTMLButtonElement>) => void
    startQuantization: (event: React.MouseEvent<HTMLButtonElement>) => void
    cancelQuantization: (event: React.MouseEvent<HTMLButtonElement>) => void
}


class Quantize extends Component<IQuantizeProps, IState>  {
    state: IState = {
        showFields: false
    };
    constructor(props: IQuantizeProps) {
        super(props)
    }

    render() {

        let { datasetSize, functionName, datasetPath, modelPath } = this.props.inputProps;
        let { showFields } = this.state;
        return (
            <div>
                <Stack>
                    <Stack.Item >
                        <Header name={"Quantization Input Parameters"} />
                    </Stack.Item>
                </Stack>
                <Stack tokens={tokens.numericalSpacing}>
                    <Stack horizontal gap={7}>
                        <Stack.Item grow>
                            <Label styles={labelStyles}>Enter path to model </Label>
                            <TextField placeholder="Enter path to model" value={modelPath} required/>
                        </Stack.Item>
                        <Stack.Item align="end" >
                            <PrimaryButton style={{ width: '200px' }} onClick={this.props.pathToModel}>Select model</PrimaryButton>
                        </Stack.Item>
                    </Stack>
                    <Toggle styles={tStyles} label="Quantize with representative data?" inlineLabel checked={showFields} onChange={this._toggleShowFields} />
                    {showFields && (
                        <>
                    <Stack horizontal gap={5} >
                    <Stack.Item grow>
                        <Label styles={labelStyles}>Enter path to data set </Label>
                        <TextField placeholder="Enter path to data set" value={datasetPath} />
                    </Stack.Item>
                    <Stack.Item align="end" >
                        <PrimaryButton style={{ width: '200px' }} onClick={this.props.pathToRepresentativeData}>Select dataset</PrimaryButton>
                    </Stack.Item>
                </Stack>     

                <Stack horizontal gap={5} >
                    <Stack.Item grow>

                        <Label styles={labelStyles} >Preprocess function </Label>
                            <TextField placeholder="preprocess_method1" value={functionName} onChange={(e: any) => this.props.quantizeFormHandler(e, "onFunctionNameChange")} />
                    </Stack.Item>
                    
                    <Stack.Item grow>
                            <Label styles={labelStyles} >Dataset size (only if using a preprocessed pb as dataset) </Label>
                            <TextField placeholder="28" value={datasetSize} onChange={(e: any) => this.props.quantizeFormHandler(e, "onDatasetSizeChange")} />
                        </Stack.Item>
                </Stack>                       
                        </>
                    )}
                    <Stack horizontal tokens={tokens.customSpacing} padding="s1 35%">
                        <Stack.Item>
                            <PrimaryButton style={{ width: '200px' }} onClick={this.props.startQuantization}>Start Quantization</PrimaryButton>

                        </Stack.Item>
                        <Stack.Item >

                            <PrimaryButton style={{ width: '200px' }} onClick={this.props.cancelQuantization}>Cancel</PrimaryButton>
                        </Stack.Item>
                    </Stack>
                </Stack>
            </div>
        );
    }
    _toggleShowFields = (ev: React.MouseEvent<HTMLElement>, checked: boolean | undefined) => {
        this.setState({ showFields: checked });
    };
}
const tokens = {
    numericalSpacing: {
        childrenGap: 10
    },
    customSpacing: {
        childrenGap: '10'
    },
};

const labelStyles: Partial<ILabelStyles> = {

    root: {
        textAlign: 'start',
        color: 'white'


    }
};
const tStyles: Partial<IToggleStyles> = {
    label: {
        color: 'white'
    }

};


export default Quantize;
