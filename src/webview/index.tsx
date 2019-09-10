import React from 'react';
import ReactDOM from 'react-dom';
import OnnxValidateInput from './components/OnnxValidateInput';

const App: React.FunctionComponent = () => {
    return (
        <div>
            <OnnxValidateInput />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));