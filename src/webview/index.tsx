import React from 'react';
import ReactDOM from 'react-dom';
import OnnxValidateInput from './components/OnnxValidateInput';
import './css/index.css'

const App: React.FunctionComponent = () => {
    return (
        <div className="container">
              <OnnxValidateInput />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));