import * as React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Pivot, PivotItem, PivotLinkFormat,PivotLinkSize, IPivotStyles } from 'office-ui-fabric-react/lib/Pivot';
import OnnxValidateInput from './OnnxValidateInput';


const Tabs: React.FunctionComponent = () => {

    return (
        <div>
            <Pivot linkFormat={PivotLinkFormat.tabs} linkSize={PivotLinkSize.large}>
                <PivotItem headerText="Validate">
                    <Label style={{color:'white'}}><OnnxValidateInput/></Label>
                </PivotItem>
                <PivotItem headerText="Quantize">
                    <Label>Input 2</Label>
                </PivotItem>
                <PivotItem headerText="Convert">
                    <Label>Input 3</Label>
                </PivotItem>
            </Pivot>
        </div>
    );
};



export default Tabs;