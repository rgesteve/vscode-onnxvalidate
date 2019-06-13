import React from 'react';
import ReactDOM from 'react-dom';

import { Stack, TextField, PrimaryButton } from "office-ui-fabric-react";


const App = () => {

    const tokens = {
        fiveGapStack : {
            childrenGap : 5
        }
    };

    return (
        <div>
            <Stack tokens={tokens.fiveGapStack}>
                <Stack.Item align="center">
                    <span>Hello, world (inside a stack)!</span>
                    <TextField value="Should be centered" placeholder="Test..." />
                </Stack.Item>
                <Stack.Item align="stretch">
                    <span>There should be a button besides</span>
                    <PrimaryButton type="submit">Should be mocking file-open</PrimaryButton>
                </Stack.Item>
            </Stack>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));