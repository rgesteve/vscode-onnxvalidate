import React from 'react';
import Header from './Header';
import { Stack, TextField, PrimaryButton, Label, Toggle, IToggleStyles } from "office-ui-fabric-react";

const OnnxQuantizeModel: React.FunctionComponent = () => {

    const tokens = {
        numericalSpacing: {
            childrenGap: 10
        },
        customSpacing: {
            childrenGap: '10'
        },
    };
   

    const [showFields, displayField] = React.useState(false);
    const [representativeDataPath, setRepresentativeDataPath] = React.useState("");
    const onItemChanged = React.useCallback(e => displayField(e), [displayField]);
    
    let PathToRepresentativeData = () => {
        window.console.log("Select path to representative data");
        // vscode.postMessage({
        //     command: 'setRepresentativeDataPath',
        //     text: 'Select path to representative data'
        // });
        window.console.log(`Sent message to host.`);

    };

    return (
        <div>
             <Stack>
               <Stack.Item >
                     <Header name={"Quantization Input Parameters"} />
                </Stack.Item>
            </Stack>
            <Stack tokens={tokens.numericalSpacing}>
            <Label style={{ color: 'white' }}>Quantize with representative data? </Label>
            <Toggle inlineLabel checked={showFields} onChange={onItemChanged} />
                {showFields && (
                <>
                <Stack horizontal gap={7}>
              
                <Stack.Item grow>
                    <Label style={{ color: 'white' }}>Path To Representative Data </Label>
                    <TextField placeholder="Enter path to data"  />   
                </Stack.Item>
                <Stack.Item align="end" >
                                <PrimaryButton style={{ width: '200px' }} onClick={PathToRepresentativeData} >Select Path to data</PrimaryButton>
                </Stack.Item>
               
                </Stack>
                </>
            )}
            <Stack horizontal tokens={tokens.customSpacing} padding="s1 35%">
                            <Stack.Item>
                                <PrimaryButton style={{ width: '200px' }}>Start Quantization</PrimaryButton>

                            </Stack.Item>
                            <Stack.Item >

                                <PrimaryButton style={{ width: '200px' }}>Cancel</PrimaryButton>
                            </Stack.Item>
                        </Stack>
                        </Stack>
        </div>
    )
};

export default OnnxQuantizeModel;
