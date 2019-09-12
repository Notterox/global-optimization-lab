import React, { Component } from 'react';

import './LabPage.scss';

import AlgorithmSettings from './components/AlgorithmSettings/AlgorithmSettings';
import SacSettings from './components/SACSettings';
import FunctionPanel from './components/FunctionPanel/FunctionPanel';

export default class LabPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      algSettings: undefined
    };
  }

  handleAlgorithmSettingsChanged = (algSettings) => {
    this.setState({ algSettings });
  };

  render() {
    return (
        <div className="LabPage">
          <div className="LabPage__left-pane">
            <AlgorithmSettings settings={this.state.algSettings} className="LabPage__left-pane-control" onChange={this.handleAlgorithmSettingsChanged} />
            <SacSettings />
          </div>
          <div className="LabPage__right-pane">
            <FunctionPanel func={this.state.algSettings?.targetFunction} />
          </div>
        </div>
    );
  }
}
