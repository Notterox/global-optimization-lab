import React, { Component } from 'react';

import './LabPage.scss';

import AlgorithmSettings from './components/AlgorithmSettings/AlgorithmSettings';
import SacSettings from './components/SACSettings';
import FunctionPanel from './components/FunctionPanel/FunctionPanel';
import OptimizationResultPanel from './components/OptimizationResultPanel';
import WorkerContext from '../../workers/WorkerContext';

export default class LabPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      targetFuncValues: null,
      functionWorkerBusy: false,
      solverWorkerBusy: false,
      algSettings: undefined,
      sacSettings: undefined
    };
  }

  static contextType = WorkerContext;

  componentDidMount() {
    this.context.functionWorker.onmessage = this.handleFunctionWorkerMessage;
    this.context.solverWorker.onmessage = this.handleSolverWorkerMessage;
  }

  handleAlgorithmSettingsChanged = (algSettings) => {
    if (this.state.algSettings?.targetFunction.id !== algSettings.targetFunction?.id) {
      this.updateTargetFunctionValues(algSettings.targetFunction);
    }

    this.setState({ algSettings });
  };

  handleFunctionWorkerMessage = (event) => {
    switch (event.data.type) {
      case 'CALCULATE_FUNCTION_VALUES_RESULT':
        this.setState({
          functionWorkerBusy: false,
          targetFuncValues: event.data.payload
        });
    }
  };

  handleSolverWorkerMessage = (event) => {

  };

  updateTargetFunctionValues = (targetFunction) => {
    if (targetFunction) {
      const { func, min, max, step } = targetFunction;
      this.setState({ functionWorkerBusy: true }, () => {
        this.context.functionWorker.postMessage({
          type: 'CALCULATE_FUNCTION_VALUES',
          payload: { func, min, max, step }
        });
      });
    }
  };

  render() {
    return (
        <div className="LabPage">
          <div className="LabPage__left-pane">
            <AlgorithmSettings
              settings={this.state.algSettings}
              className="LabPage__left-pane-control"
              onChange={this.handleAlgorithmSettingsChanged}
              funcSelectorDisabled={this.state.functionWorkerBusy}
            />
            <SacSettings settings={this.state.sacSettings} onChange={s => this.setState({ sacSettings: s })} />
          </div>
          <div className="LabPage__right-pane">
            <FunctionPanel
              calculating={this.state.functionWorkerBusy}
              func={this.state.algSettings?.targetFunction}
              functionValues={this.state.targetFuncValues}
            />
            <OptimizationResultPanel />
          </div>
        </div>
    );
  }
}
