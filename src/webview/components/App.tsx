import React from 'react';
import { Pivot, PivotItem, PivotLinkFormat, PivotLinkSize, IPivotStyles } from 'office-ui-fabric-react/lib/Pivot';
import Convert from './Convert';
import Quantize from './Quantize';
import Validate from './Validate';
import { Label } from 'office-ui-fabric-react/lib/Label';


const App: React.FunctionComponent = () => {
    return (
        <div className="container-header">
            <Pivot styles={pivotStyles} linkFormat={PivotLinkFormat.tabs} linkSize={PivotLinkSize.large}>
                <PivotItem headerText="Convert">
                    <Label style={{ color: 'white'}}><Convert /></Label>
                </PivotItem>
                <PivotItem headerText="Quantize">
                    <Label style={{ color: 'white'}}><Quantize /></Label>
                </PivotItem>
                <PivotItem headerText="Validate">
                    <Label style={{ color: 'white'}}><Validate /></Label>
                </PivotItem>
            </Pivot>
        </div>
    );
};

const pivotStyles: Partial<IPivotStyles> = {
    linkContent: {
        fontSize: "20px",
        width: "525px",
    },
    root: {
        lineHeight: "100px"

    }
};
export default App;