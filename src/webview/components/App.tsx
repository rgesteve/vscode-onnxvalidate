import React from 'react';
import Validate from './Validate';
import { Pivot, PivotItem, PivotLinkFormat, PivotLinkSize, IPivotStyles } from 'office-ui-fabric-react/lib/Pivot';
import {IStyleSet} from "office-ui-fabric-react/lib/Styling";
import Convert from './Convert';
import OnnxQuantizeModel from './OnnxQuantizeModel';
import { Label } from 'office-ui-fabric-react/lib/Label';

const App: React.FunctionComponent = () => {
    return (
        <div className="container-header">
            <Pivot styles={pivotStyles} linkFormat={PivotLinkFormat.tabs} linkSize={PivotLinkSize.large}>
                <PivotItem headerText="Convert">
                    <Label style={{ color: 'white' }}><Convert /></Label>
                </PivotItem>
                <PivotItem headerText="Quantize">
                    <Label style={{ color: 'white' }}><OnnxQuantizeModel /></Label>
                </PivotItem>
                <PivotItem headerText="Validate">
                    <Label style={{ color: 'white' }}><Validate /></Label>
                </PivotItem>
            </Pivot>
        </div>
    );
};

const pivotStyles: Partial<IStyleSet<IPivotStyles>> = {
    linkContent: {
        fontSize: "20px",
        width: "525px" ,
      },
      root:{
        lineHeight:"100px"
        
      }
  };
export default App;