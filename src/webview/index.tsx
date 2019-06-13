import React from 'react';
import ReactDOM from 'react-dom';
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";


const App = () => {
    return (
        <div>
            <p>Hello, world (changed)!</p>
            <TextField value="This is a test" placeholder="Test..." />
            <p>There should be a text field above this line and a button beneath</p>
            <PrimaryButton type="submit">Contents of Button</PrimaryButton>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));