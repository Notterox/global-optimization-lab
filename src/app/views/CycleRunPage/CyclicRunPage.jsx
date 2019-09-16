import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Intent, ProgressBar } from '@blueprintjs/core';
import Plot from 'react-plotly.js';

import './CyclicRunPage.scss';
import AlgorithmSettings from '../LabPage/components/AlgorithmSettings';
import SacSettings from '../LabPage/components/SACSettings';
import CyclicRunSettings from './components/CyclicRunSettings';
import WorkerContext from '../../workers/WorkerContext';

class CyclicRunPage extends Component {
  static propTypes = {
    className: PropTypes.string,
  };

  static defaultProps = {
    className: ''
  };

  static contextType = WorkerContext;

  constructor(props) {
    super(props);

    this.state = {
      algSettings: undefined,
      sacSettings: undefined,
      cyclicRunSettings: undefined,
      errorValues1: null,
      errorValues2: null,
      runNumValues: null,
      iterationsValues: null,
      progress: 0,
      running: false
    };
  }

  componentDidMount() {
    this.context.cyclicRunWorker.onmessage = this.handleCyclicRunWorkerMessage;
  }

  handleCyclicRunWorkerMessage = (event) => {
    switch (event.data.type) {
      case 'CYCLIC_RUN_CHUNK':
        this.addChunk(this.state.minPoint, event.data.payload.chunk, event.data.payload.progress);
        break;
      case 'CYCLIC_RUN_END':
        this.setState({
          running: false
        });
        break;
    }
  };

  getRunNumValues = (amount) => {
    const values = [];
    values.length = amount;

    for (let i = 0; i < amount; i++) {
      values[i] = i + 1;
    }

    return values;
  };

  handleStartCyclicRun = () => {
    this.setState({
      progress: 0,
      errorValues1: [],
      errorValues2: [],
      iterationsValues: [],
      runNumValues: this.getRunNumValues(this.state.cyclicRunSettings.amount),
      minPoint: this.state.algSettings.targetFunction.minPoint,
      running: true
    });
    this.context.cyclicRunWorker.postMessage({
      type: 'CYCLIC_RUN_START',
      payload: {
        amount: this.state.cyclicRunSettings.amount,
        algSettings: this.state.algSettings,
        sacSettings: this.state.sacSettings
      }
    });
  };

  addChunk = (minPoint, chunk, progress) => {
    const {
      errorValues1,
      errorValues2,
      iterationsValues
    } = this.state;
    const errorChunk1 = [];
    const errorChunk2 = [];
    const iterationsChunk = [];

    chunk.forEach((ch) => {
      const error = this.diffPoints(ch.point, minPoint);
      errorChunk1.push(error[0]);
      errorChunk2.push(error[1]);
      iterationsChunk.push(ch.iterations);
    });

    this.setState({
      errorValues1: (errorValues1 || []).concat(errorChunk1),
      errorValues2: (errorValues2 || []).concat(errorChunk2),
      iterationsValues: (iterationsValues || []).concat(iterationsChunk),
      progress
    });
  };

  diffPoints = (p1, p2) => {
    return [Math.abs(p1[0] - p2[0]), Math.abs(p1[1] - p2[1])];
  };

  isValid = () => [
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
    Number.isInteger(+this.state.cyclicRunSettings?.amount)
  ].every(e => !!e);

  render() {
    return (
      <div className={`CycleRunPage ${this.props.className}`}>
        <div className="CycleRunPage__left-pane">
          <Button
            fill
            large
            icon="play"
            intent={Intent.PRIMARY}
            disabled={!this.isValid() || this.state.running}
            onClick={this.handleStartCyclicRun}
          >
            Запустить
          </Button>
          {
            this.state.running
            && <ProgressBar value={this.state.progress} intent={Intent.PRIMARY} />
          }
          <CyclicRunSettings
            settings={this.state.cyclicRunSettings}
            onChange={s => this.setState({ cyclicRunSettings: s })}
            onInit={s => this.setState({ cyclicRunSettings: s })}
          />
          <AlgorithmSettings
            settings={this.state.algSettings}
            onChange={s => this.setState({ algSettings: s })}
          />
          <SacSettings
            settings={this.state.sacSettings}
            onChange={s => this.setState({ sacSettings: s })}
          />
        </div>
        <div className="CycleRunPage__right-pane">
          {
            this.state.errorValues1
            && this.state.errorValues2
            && this.state.iterationsValues
            && this.state.runNumValues
            && (
              <>
                <Plot
                  data={[
                    {
                      x: this.state.runNumValues,
                      y: this.state.errorValues1,
                      mode: 'lines',
                      type: 'scattergl'
                    },
                    {
                      x: this.state.runNumValues,
                      y: this.state.errorValues2,
                      mode: 'lines',
                      type: 'scattergl'
                    }
                  ]}
                  layout={{
                    xaxis: {
                      range: [1, this.state.runNumValues.length]
                    }
                  }}
                />
                <Plot
                  data={[
                    {
                      x: this.state.runNumValues,
                      y: this.state.iterationsValues,
                      mode: 'lines',
                      type: 'scattergl'
                    }
                  ]}
                  layout={{
                    xaxis: {
                      range: [1, this.state.runNumValues.length]
                    }
                  }}
                />
              </>
            )
          }
        </div>
      </div>
    );
  }
}

export default CyclicRunPage;
