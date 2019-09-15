import React, { Component } from 'react';
import { Button, Intent } from '@blueprintjs/core';

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
      sacSettings: undefined,
      solution: undefined,
      solutionFuncValues: null,
      solutionActualMinimum: [0, 0],
      functionValuesRevision: ''
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
    switch (event.data.type) {
      case 'SOLVE_SUCCESS':
        this.setState({
          solverWorkerBusy: false,
          solution: event.data.payload,
          solutionFuncValues: this.state.targetFuncValues,
          solutionActualMinimum: this.state.algSettings?.targetFunction.minPoint,
          solutionFunctionRevision: [
            this.state.algSettings?.targetFunction.id,
            this.state.algSettings?.xmin,
            this.state.algSettings?.xmax,
            this.state.algSettings?.ymin,
            this.state.algSettings?.ymax
          ].join('_')
        });
    }
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

  validateSettings = () => {
    return [
      this.state.algSettings?.targetFunction?.id,
      Number.isFinite(+this.state.algSettings?.xmin),
      Number.isFinite(+this.state.algSettings?.xmax),
      Number.isFinite(+this.state.algSettings?.ymin),
      Number.isFinite(+this.state.algSettings?.ymax),
      this.state.sacSettings?.kernel,
      Number.isFinite(+this.state.sacSettings?.selectionRate),
      Number.isFinite(+this.state.sacSettings?.shrinkRate),
      Number.isFinite(+this.state.sacSettings?.shrinkMult),
      Number.isInteger(+this.state.sacSettings?.trialsAmount),
    ].every(e => !!e);
  };

  solve = () => {
    this.setState({ solverWorkerBusy: true }, () => {
      const { algSettings, sacSettings } = this.state;
      this.context.solverWorker.postMessage({
        type: 'SOLVE',
        payload: { algSettings, sacSettings }
      });
    });
  };

  render() {
    return (
        <div className="LabPage">
          <div className="LabPage__left-pane">
            <Button
              fill
              large
              icon="play"
              intent={Intent.PRIMARY}
              disabled={!this.validateSettings()}
              loading={this.state.solverWorkerBusy}
              onClick={this.solve}
            >
              Запустить
            </Button>
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
            <OptimizationResultPanel
              functionValuesRevision={this.state.solutionFunctionRevision}
              functionValues={this.state.solutionFuncValues}
              solution={this.state.solution}
              calculating={this.state.solverWorkerBusy}
              minPoint={this.state.solutionActualMinimum}
            />
          </div>
        </div>
    );
  }
}
