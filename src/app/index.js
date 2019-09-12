import React from 'react';
import ReactDOM from 'react-dom';

import './index.scss';
import "normalize.css/normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

import LabPage from './views/LabPage';

// eslint-disable-next-line react/jsx-filename-extension
ReactDOM.render(<LabPage/>, document.getElementById('app'));
