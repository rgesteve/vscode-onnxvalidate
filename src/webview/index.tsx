import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './components/App'
//import {dlToolkitChannel} from '../extension/dlToolkitChannel'
const Index: React.FunctionComponent = () => {
    return (
        <div className="container">
               <App />
        </div>
    );
};

ReactDOM.render(<Index />, document.getElementById('root'));