import React from 'react';
import Validate from './Validate';
import { Pivot, PivotItem, PivotLinkFormat, PivotLinkSize, IPivotStyles } from 'office-ui-fabric-react/lib/Pivot';
import OnnxConvertModel from './OnnxConvertModel';
import OnnxQuantizeModel from './OnnxQuantizeModel';
import { Label } from 'office-ui-fabric-react/lib/Label';

const App: React.FunctionComponent = () => {
    return (
        <div className="container-header">
            <Pivot styles={temp} linkFormat={PivotLinkFormat.tabs} linkSize={PivotLinkSize.large}>
                <PivotItem headerText="Convert">
                    <Label style={{ color: 'white' }}><OnnxConvertModel /></Label>
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

const temp: IPivotStyles = {
    root: {
        //  // padding: '0 550px',
        //  //marginLeft:'100px',
        //  margin:"300%",
        //  width:"100%",
        //  marginLeft:"auto",
        //  marginRight:'auto',
        //  display:"inline-flex",
        lineHeight: "100px"

    },
    count: {}, icon: {}, itemContainer: {}, link: { borderImageWidth: "100px" }, linkContent: {}, linkIsSelected: {}, text: {}
}
export default App;