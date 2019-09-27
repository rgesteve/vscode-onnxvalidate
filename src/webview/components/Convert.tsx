import React, { Component } from 'react';
import Header from './Header';
import { Stack, TextField, PrimaryButton, Label, Spinner, ILabelStyles } from "office-ui-fabric-react";
import { ConversionInputParams } from './ConversionHelper';

interface IConvertProps {
    //variables
    inputProps: ConversionInputParams

    formHandler: (e: any, task: String) => void;
    startConversion: (event: React.MouseEvent<HTMLButtonElement>) => void
    cancelConversion: (event: React.MouseEvent<HTMLButtonElement>) => void
}

class Convert extends Component<IConvertProps, {}>{


    constructor(props: IConvertProps) {
        super(props);
    }


    render() {
        let { inputNode, outputNode, opset } = this.props.inputProps;
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
                            <Label styles={labelStyles} >Enter Input node </Label>
                            <TextField placeholder="Enter Input node" value={inputNode} onChange={(e: any) => this.props.formHandler(e, "onInputNodeChange")} />
                        </Stack.Item>
                        <Stack.Item grow>
                            <Label styles={labelStyles}>Enter Output node </Label>
                            <TextField placeholder="Enter Output node" value={outputNode} onChange={(e: any) => this.props.formHandler(e, "onOutputNodeChange")} />
                        </Stack.Item>
                        <Stack.Item grow>
                            <Label styles={labelStyles}>Enter opset </Label>
                            <TextField placeholder="Default value is 8" value={opset} onChange={(e: any) => this.props.formHandler(e, "onOpsetChange")} />
                        </Stack.Item>
                    </Stack>

                    <Stack horizontal tokens={tokens.customSpacing} padding="s1 35%">
                        <Stack.Item>
                            <PrimaryButton style={{ width: '200px' }} onClick={this.props.startConversion}>Start Conversion</PrimaryButton>

                        </Stack.Item>
                        <Stack.Item >

                            <PrimaryButton style={{ width: '200px' }} onClick={this.props.cancelConversion}>Cancel</PrimaryButton>
                        </Stack.Item>
                    </Stack>
                </Stack>
            </div>

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

const labelStyles: Partial<ILabelStyles> = {

    root: {
        textAlign: 'start',
        color: 'white'


    }
};
export default Convert;
