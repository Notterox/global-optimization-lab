import React, { Component } from 'react';

import './LabPage.scss';

import AlgorithmSettings from './components/AlgorithmSettings/AlgorithmSettings';
import SacSettings from './components/SACSettings';

export default class LabPage extends Component {
  render() {
    return (
      <div className="LabPage">
        <div className="LabPage__left-pane">
          <AlgorithmSettings className="LabPage__left-pane-control" />
          <SacSettings />
        </div>
        <div className="LabPage__right-pane"></div>
      </div>
    )
  }
}
