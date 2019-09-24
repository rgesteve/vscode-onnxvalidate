import React from 'react';
import Header from './Header';
import { Stack, TextField, PrimaryButton, Label, Spinner } from "office-ui-fabric-react";
 

// declare var acquireVsCodeApi: any;
// const vscode = acquireVsCodeApi();
const OnnxConvertModel: React.FunctionComponent = () => {

    const tokens = {
        numericalSpacing: {
            childrenGap: 10
        },
        customSpacing: {
            childrenGap: '10'
        },
    };
    const [inputNode, setInputNode] = React.useState("");
    const [outputNode, setOutputNode] = React.useState("");
    const [opsetNode, setOpsetNode] = React.useState("");

    React.useEffect(() => {
        console.log("Getting input node");
        window.console.log(inputNode);
        window.console.log("Testing......");
        // vscode.postMessage(
        //     {
        //         command: 'setInputNode',
        //         text: inputNode
        //     }
        // );
        window.console.log(`Sent message to host.`);

        console.log("Getting input node");
        window.console.log(outputNode);
        window.console.log("Testing......");
        // vscode.postMessage(
        //     {
        //         command: 'setOutputNode',
        //         text: outputNode
        //     }
        // );
        window.console.log(`Sent message to host.`);

        console.log("Getting opset node");
        window.console.log(opsetNode);
        window.console.log("Testing......");
        // vscode.postMessage(
        //     {
        //         command: 'setOutputNode',
        //         text: outputNode
        //     }
        // );
        window.console.log(`Sent message to host.`);



    },[inputNode,outputNode,opsetNode]);

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
                    <TextField placeholder="Enter Input node" value={inputNode} onChange={event => { setInputNode((event.target as HTMLInputElement).value)}} />
                </Stack.Item>
                <Stack.Item grow>
                    <Label style={{ color: 'white' }}>Enter Output node </Label>
                    <TextField placeholder="Enter Output node" value={outputNode} onChange={event => { setOutputNode((event.target as HTMLInputElement).value)}} />
                </Stack.Item>
                <Stack.Item grow>
                    <Label style={{ color: 'white' }}>Enter opset </Label>
                    <TextField placeholder="Default value is 8" value={opsetNode} onChange={event => { setOutputNode((event.target as HTMLInputElement).value)}} />
                </Stack.Item>
                </Stack>
           
            <Stack horizontal tokens={tokens.customSpacing} padding="s1 35%">
                            <Stack.Item>
                                <PrimaryButton style={{ width: '200px' }}>Start Conversion</PrimaryButton>

                            </Stack.Item>
                            <Stack.Item >

                                <PrimaryButton style={{ width: '200px' }}>Cancel</PrimaryButton>
                            </Stack.Item>
                        </Stack>
                        </Stack>
        </div>
    )
};
export default OnnxConvertModel;
