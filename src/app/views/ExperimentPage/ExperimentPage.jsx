import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, H4, Intent, ProgressBar } from '@blueprintjs/core';
import Plot from 'react-plotly.js';

import './ExperimentPage.scss';
import AlgorithmSettings from '../LabPage/components/AlgorithmSettings';
import SacSettings from '../LabPage/components/SACSettings';
import ExperimentSettings from './components/ExperimentSettings';
import WorkerContext from '../../workers/WorkerContext';

const errorTitles = {
  selectionRate: 'График расстояния между найденной точки и глоб. минимумом для значения степени селективности',
  shrinkMult: 'График расстояния между найденной точки и глоб. минимумом для значения коэф. сжатия',
  shrinkRate: 'График расстояния между найденной точки и глоб. минимумом для значения степени сжатия',
  trialsAmount: 'График расстояния между найденной точки и глоб. минимумом для значения кол-ва проб. точек'
};

const iterationsTitles = {
  selectionRate: 'График кол-ва итераций для значения степени селективностиа',
  shrinkMult: 'График кол-ва итераций для значения коэф. сжатия',
  shrinkRate: 'График кол-ва итераций для значения степени сжатия',
  trialsAmount: 'График кол-ва итераций для значения значения кол-ва проб. точек'
};

const axisTitle = {
  selectionRate: 'Степень селективности',
  shrinkMult: 'Коэф. сжатия',
  shrinkRate: 'Степень сжатия',
  trialsAmount: 'Кол-во пробных точек'
};

class ExperimentPage extends Component {
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
      experimentSettings: undefined,
      precision: 0.1,
      errorsAmount: 0,
      errorValues: null,
      parameterValues: null,
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
      case 'EXPERIMENT_RUN_CHUNK':
        console.log('EXPERIMENT_RUN_CHUNK', event.data.payload);
        this.addChunk(
          this.state.minPoint,
          event.data.payload.chunk,
          event.data.payload.parametersValuesChunk,
          event.data.payload.progress
        );
        break;
      case 'EXPERIMENT_RUN_END':
        console.log('EXPERIMENT_RUN_END', event.data.payload);
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

  handleStartExperiment = () => {
    this.setState({
      progress: 0,
      errorValues: [],
      errorsAmount: 0,
      iterationsValues: [],
      parameterValues: [],
      minPoint: this.state.algSettings.targetFunction.minPoint,
      running: true
    });
    this.context.cyclicRunWorker.postMessage({
      type: 'EXPERIMENT_RUN_START',
      payload: {
        experimentSettings: this.state.experimentSettings,
        algSettings: this.state.algSettings,
        sacSettings: this.state.sacSettings
      }
    });
  };

  addChunk = (minPoint, chunk, parameterValuesChunk, progress) => {
    const {
      errorValues,
      iterationsValues,
      errorsAmount,
      parameterValues
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
      parameterValues: (parameterValues || []).concat(parameterValuesChunk),
      progress
    });
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
    Number.isFinite(+this.state.experimentSettings?.start),
    Number.isFinite(+this.state.experimentSettings?.end),
    Number.isFinite(+this.state.experimentSettings?.step)
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
            onClick={this.handleStartExperiment}
          >
            Запустить
          </Button>
          {
            this.state.running
            && <ProgressBar value={this.state.progress} intent={Intent.PRIMARY} />
          }
          <ExperimentSettings
            settings={this.state.experimentSettings}
            onChange={s => this.setState({ experimentSettings: s })}
            onInit={s => this.setState({ experimentSettings: s })}
          />
          <AlgorithmSettings
            settings={this.state.algSettings}
            onChange={s => this.setState({ algSettings: s })}
          />
          <SacSettings
            settings={this.state.sacSettings}
            onChange={s => this.setState({ sacSettings: s })}
            disabledField={this.state.experimentSettings?.parameter}
          />
          <br />
          <br />
          <br />
        </div>
        <div className="CycleRunPage__right-pane">
          {
            this.state.errorValues
            && this.state.iterationsValues
            && this.state.parameterValues
            && (
              <>
                <Plot
                  data={[
                    {
                      x: this.state.parameterValues,
                      y: this.state.errorValues,
                      mode: 'lines',
                      type: 'scattergl'
                    }
                  ]}
                  layout={{
                    width: 700,
                    height: 300,
                    title: {
                      text: errorTitles[this.state.experimentSettings.parameter],
                      font: { size: 12 }
                    },
                    xaxis: {
                      title: axisTitle[this.state.experimentSettings.parameter]
                    },
                    yaxis: {
                      title: '|Xalg-Xmin|'
                    },
                    margin: {
                      t: 45,
                      l: 40,
                      b: 40,
                      r: 20
                    }
                  }}
                />
                <br />
                <Plot
                  data={[
                    {
                      x: this.state.parameterValues,
                      y: this.state.iterationsValues,
                      mode: 'lines',
                      type: 'scattergl'
                    }
                  ]}
                  layout={{
                    width: 700,
                    height: 300,
                    title: {
                      text: iterationsTitles[this.state.experimentSettings.parameter],
                      font: { size: 12 }
                    },
                    xaxis: {
                      title: axisTitle[this.state.experimentSettings.parameter]
                    },
                    yaxis: {
                      title: 'Количество итераций'
                    },
                    pad: {
                      l: 10
                    },
                    margin: {
                      t: 45,
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

export default ExperimentPage;
