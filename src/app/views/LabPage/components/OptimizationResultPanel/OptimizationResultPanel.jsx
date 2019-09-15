import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Checkbox, Divider, H4, Slider } from '@blueprintjs/core';
import Plot from 'react-plotly.js';
import zip from 'lodash/zip';

import './OptimizationResultPanel.scss';

export default class OptimizationResultPanel extends Component {
  static propTypes = {
    className: PropTypes.string,
    functionValuesRevision: PropTypes.string,
    functionValues: PropTypes.shape({
      z: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
      x: PropTypes.arrayOf(PropTypes.number),
      y: PropTypes.arrayOf(PropTypes.number)
    }),
    solution: PropTypes.shape({
      point: PropTypes.arrayOf(PropTypes.number),
      iterations: PropTypes.number,
      log: PropTypes.arrayOf(PropTypes.shape({
        point: PropTypes.arrayOf(PropTypes.number),
        delta: PropTypes.arrayOf(PropTypes.number)
      }))
    }),
    minPoint: PropTypes.arrayOf(PropTypes.number)
  };

  static defaultProps = {
    className: '',
    functionValues: null,
    solution: null,
    minPoint: [0, 0]
  };

  constructor(props) {
    super(props);

    this.state = {
      currentIteration: 0,
      showTrials: false,
      contourPlot: {
        data: this.getContourPlotData(),
        layout: {
          autosize: true,
          width: 700,
          height: 500,
          margin: {
            t: 20,
            b: 20
          }
        },
        frames: [],
        config: {}
      },
      functionValuesPlot: {
        data: [],
        layout: {
          margin: {
            t: 20,
            b: 20
          }
        },
        frames: [],
        config: {}
      },
      deltaPlot: {
        data: [],
        layout: {
          margin: {
            t: 20,
            b: 20
          }
        },
        frames: [],
        config: {}
      },
      pointPlot: {
        data: [],
        layout: {
          margin: {
            t: 20,
            b: 20
          }
        },
        frames: [],
        config: {}
      }
    };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (nextProps.solution !== this.props.solution) {
      nextState.currentIteration = nextProps.solution.iterations;
      nextState.contourPlot.data = this.getContourPlotData(nextProps, nextState);
      nextState.functionValuesPlot.data = this.getFunctionValuePlotData(nextProps, nextState);
      nextState.deltaPlot.data = this.getDeltaPlotData(nextProps, nextState);
      nextState.pointPlot.data = this.getPointPlotData(nextProps, nextState);
    } else if (nextState.currentIteration !== this.state.currentIteration ||
      nextState.showTrials !== this.state.showTrials) {
      nextState.contourPlot.data = this.getContourPlotData(nextProps, nextState);
    }

    return true;
  }

  getContourPlotData = (props = this.props, state = this.state) => {
    if (!props.solution) {
      return [];
    }

    const data = [
      {
        ...props.functionValues,
        type: 'contour',
        showscale: false,
        colorbar: {
          thickness: 10
        },
        autocontour: true,
        ncontours: 20,
        colorscale: 'Electric',
        hoverinfo: 'none',
        contours: {
          coloring: 'lines',
          showlabels: true
        },
        line: {
          width: 2
        },
        revision: props.functionValuesRevision
      },
      this.getDeltaTrace(
        props.solution.log[state.currentIteration].point,
        props.solution.log[state.currentIteration].delta
      ),
      this.getTrajectoryTrace(props.solution.log, state.currentIteration),
      {
        x: [props.minPoint[0]],
        y: [props.minPoint[1]],
        mode: 'markers',
        type: 'scattergl',
        name: 'Минимум функции'
      }
    ];

    if (state.showTrials) {
      data.push({
        x: props.solution.log[state.currentIteration].trials[0],
        y: props.solution.log[state.currentIteration].trials[1],
        mode: 'markers',
        type: 'scattergl',
        name: 'Пробные точки',
        marker: {
          color: 'rgb(0,0,255)'
        }
      });
    }

    return data;
  };

  getFunctionValuePlotData = (props = this.props, state = this.state) => {
    if (!props.solution) {
      return [];
    }

    const x = [];
    const y = [];

    props.solution.log.forEach((log, i) => {
      x.push(i);
      y.push(log.value);
    });

    return [
      {
        x, y,
        mode: 'lines+markers',
        type: 'scatter'
      }
    ];
  };

  getDeltaPlotData = (props = this.props, state = this.state) => {
    if (!props.solution) {
      return [];
    }

    const x = [];
    const y1 = [];
    const y2 = [];

    props.solution.log.forEach((log, i) => {
      x.push(i);
      y1.push(log.delta[0]);
      y2.push(log.delta[1]);
    });

    return [
      {
        x, y: y1,
        mode: 'lines+markers',
        type: 'scatter'
      },
      {
        x, y: y2,
        mode: 'lines+markers',
        type: 'scatter'
      }
    ];
  };

  getPointPlotData = (props = this.props, state = this.state) => {
    if (!props.solution) {
      return [];
    }

    const x = [];
    const y1 = [];
    const y2 = [];

    props.solution.log.forEach((log, i) => {
      x.push(i);
      y1.push(log.point[0]);
      y2.push(log.point[1]);
    });

    return [
      {
        x, y: y1,
        mode: 'lines+markers',
        type: 'scatter'
      },
      {
        x, y: y2,
        mode: 'lines+markers',
        type: 'scatter'
      }
    ];
  };

  getDeltaTrace = (point, delta) => {
    const x = [point[0] + delta[0], point[0] + delta[0], point[0] - delta[0], point[0] - delta[0], point[0] + delta[0]];
    const y = [point[1] + delta[1], point[1] - delta[1], point[1] - delta[1], point[1] + delta[1], point[1] + delta[1]];

    return {
      x,
      y,
      mode: 'lines+markers',
      type: 'scattergl',
      showlegend: false,
      showlabels: false,
      hoverinfo: 'none',
      marker: {
        ypad: 0,
        xpad: 0
      }
    };
  };

  getTrajectoryTrace = (log, till) => {
    if (typeof till === 'undefined') {
      till = log.length - 1;
    }

    const x = [];
    const y = [];
    const text= [];

    for(let i = 0; i <= till; i++) {
      x.push(log[i].point[0]);
      y.push(log[i].point[1]);
      text.push(i);
    }

    return {
      x, y,
      mode: 'lines+markers+text',
      type: 'scattergl',
      showlegend: false,
      name: 'Траектория'
    };
  };

  render() {
    return (
      this.props.solution && <div className={`OptimizationResultPanel ${this.props.className}`}>
        <Card>
          <H4>Результат оптимизации</H4>
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <div>
              <Plot
                data={this.state.contourPlot.data}
                layout={this.state.contourPlot.layout}
              />
            </div>
            <div style={{ width: 500, marginLeft: 15 }}>
              <Slider
                value={this.state.currentIteration}
                max={this.props.solution.iterations}
                onChange={v => this.setState({ currentIteration: v })}
              />
              <Checkbox value={this.state.showTrials} onChange={e => this.setState({ showTrials: e.target.checked })}>
                Показать пробные точки
              </Checkbox>
              <div>
                <div>Решение в точке {`(${this.props.solution.point.map(n => Number(n).toPrecision(2)).join(', ')})`}</div>
                <div>Итераций {this.props.solution.iterations}</div>
                <div>Ошибка решения {zip(this.props.solution.point, this.props.minPoint).map(([c1, c2]) => Math.abs(c1 - c2).toPrecision(3)).join(', ')}</div>
              </div>
            </div>
          </div>
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Plot
              data={this.state.functionValuesPlot.data}
              layout={this.state.functionValuesPlot.layout}
            />
            <Plot
              data={this.state.deltaPlot.data}
              layout={this.state.deltaPlot.layout}
            />
            <Plot
              data={this.state.pointPlot.data}
              layout={this.state.pointPlot.data}
            />
          </div>
        </Card>
      </div>
    );
  }
}
