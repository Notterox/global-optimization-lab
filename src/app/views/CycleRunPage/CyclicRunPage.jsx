import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, H4, Intent, ProgressBar } from '@blueprintjs/core';
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
      precision: 0.1,
      errorsAmount: 0,
      errorValues: null,
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
      errorValues: [],
      errorsAmount: 0,
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
      errorValues,
      iterationsValues,
      errorsAmount
    } = this.state;
    const errorChunk = [];
    let errorsAmountInChunk = 0;
    const iterationsChunk = [];

    chunk.forEach((ch) => {
      const error = this.distPoints(ch.point, minPoint);
      errorChunk.push(error);
      iterationsChunk.push(ch.iterations);
      if (error > this.state.precision) {
        errorsAmountInChunk += 1;
      }
    });

    this.setState({
      errorValues: (errorValues || []).concat(errorChunk),
      iterationsValues: (iterationsValues || []).concat(iterationsChunk),
      errorsAmount: errorsAmount + errorsAmountInChunk,
      progress
    });
  };

  diffPoints = (p1, p2) => {
    return [Math.abs(p1[0] - p2[0]), Math.abs(p1[1] - p2[1])];
  };

  distPoints = (p1, p2) => Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));

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
          <br />
          <br />
          <br />
        </div>
        <div className="CycleRunPage__right-pane">
          {
            this.state.errorValues
            && this.state.iterationsValues
            && this.state.runNumValues
            && (
              <>
                <H4>{`Количество ошибок ${this.state.errorsAmount} / ${this.state.runNumValues.length} = ${(this.state.errorsAmount / this.state.runNumValues.length * 100).toPrecision(2)}%`}</H4>
                <Plot
                  data={[
                    {
                      x: this.state.runNumValues,
                      y: this.state.errorValues,
                      mode: 'lines',
                      type: 'scattergl'
                    }
                  ]}
                  layout={{
                    width: 700,
                    height: 300,
                    title: {
                      text: 'График расстояния между найденной точки и глобальным минимумом для каждого прогона',
                      font: {
                        size: 14
                      }
                    },
                    xaxis: {
                      title: 'Номер прогона',
                      range: [1, this.state.runNumValues.length]
                    },
                    yaxis: {
                      title: '|Xalg-Xmin|'
                    },
                    margin: {
                      t: 20,
                      l: 40,
                      b: 40,
                      r: 20
                    }
                  }}
                />
                <br/>
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
                    width: 700,
                    height: 300,
                    title: {
                      text: 'График количества итераций для каждого прогона',
                      font: {
                        size: 14
                      }
                    },
                    xaxis: {
                      title: 'Номер прогона',
                      range: [1, this.state.runNumValues.length]
                    },
                    yaxis: {
                      title: 'Количество итераций'
                    },
                    margin: {
                      t: 20,
                      l: 40,
                      b: 40,
                      r: 20
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
