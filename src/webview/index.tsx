import React from 'react';
import ReactDOM from 'react-dom';
import OnnxValidateInput from './components/OnnxValidateInput';
import './css/index.css';
import Tabs from './components/Tabs'

const App: React.FunctionComponent = () => {
    return (
        <div className="container">
              {/* <OnnxValidateInput /> */}
               <Tabs /> 
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));