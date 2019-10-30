import React, { Component } from 'react';
import Header from './Header';
import { Stack, TextField, PrimaryButton, Label, Toggle, ILabelStyles, IToggleStyles } from "office-ui-fabric-react";
import { QuantizeInputParams } from './QuantizeHelper';

interface IState {

    showFields: boolean | undefined
}

interface IQuantizeProps {
    inputProps: QuantizeInputParams;
    pathToModel: (event: React.MouseEvent<HTMLButtonElement>) => void
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

        let { datasetPath, modelPath } = this.props.inputProps;
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
                            <TextField placeholder="Enter path to model" value={modelPath} />
                        </Stack.Item>
                        <Stack.Item align="end" >
                            <PrimaryButton style={{ width: '200px' }} onClick={this.props.pathToModel}>Select Path to model</PrimaryButton>
                        </Stack.Item>
                    </Stack>
                    <Toggle styles={tStyles} label="Quantize with representative data?" inlineLabel checked={showFields} onChange={this._toggleShowFields} />
                    {showFields && (
                        <>
                            <Stack horizontal gap={7}>

                                <Stack.Item grow>
                                    <Label styles={labelStyles}>Path To Representative Data </Label>
                                    <TextField placeholder="Enter path to data" value={datasetPath} />
                                </Stack.Item>
                                <Stack.Item align="end" >
                                    <PrimaryButton style={{ width: '200px' }} onClick={this.props.pathToRepresentativeData} >Select Path to data</PrimaryButton>
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
