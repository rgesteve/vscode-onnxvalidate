import React, { Component } from 'react';
import Header from './Header';
import { Stack, TextField, PrimaryButton, Label, Toggle, ILabelStyles  } from "office-ui-fabric-react";
import { QuantizeInputParams } from './QuantizeHelper';


interface IQuantizeProps {
    inputProps:QuantizeInputParams;

    toggleShowFields:(event: React.MouseEvent<HTMLButtonElement>)=>void
    PathToRepresentativeData:(event: React.MouseEvent<HTMLButtonElement>)=>void
    startQuantization: (event: React.MouseEvent<HTMLButtonElement>) => void
    cancelQuantization: (event: React.MouseEvent<HTMLButtonElement>) => void
}


class Quantize extends Component<IQuantizeProps,{}>  {

    constructor(props: IQuantizeProps) {
        super(props)
    }


    render() {
        let { showFields, representativeDataPath } = this.props.inputProps;
        return (
            <div>
                <Stack>
                    <Stack.Item >
                        <Header name={"Quantization Input Parameters"} />
                    </Stack.Item>
                </Stack>
                <Stack tokens={tokens.numericalSpacing}>
                    <Label style={{color:'white'}}>Quantize with representative data? </Label>
                    <Toggle inlineLabel checked={showFields} onChange={(e:any) => {this.props.toggleShowFields(e)}} />
                    {showFields && (
                        <>
                            <Stack horizontal gap={7}>

                                <Stack.Item grow>
                                    <Label styles={labelStyles}>Path To Representative Data </Label>
                                    <TextField placeholder="Enter path to data" value={representativeDataPath} />
                                </Stack.Item>
                                <Stack.Item align="end" >
                                    <PrimaryButton style={{ width: '200px' }} onClick={this.props.PathToRepresentativeData} >Select Path to data</PrimaryButton>
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
