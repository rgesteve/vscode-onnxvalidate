import React from 'react';
import ReactDOM from 'react-dom';
import OnnxValidateInput from './components/OnnxValidateInput';
import OnnxDisplayResult from './components/OnnxDisplayResult';
import './components/Header';

const App: React.FunctionComponent = () => {
    return (
        <div className="container">
            {/* <OnnxValidateInput /> */}
            <OnnxDisplayResult />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));