import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, H4, Intent, Spinner } from '@blueprintjs/core';
import Plot from 'react-plotly.js';
import Latex from 'react-latex';
import FunctionWorkerContext from '../../../../workers/FunctionWorkerContext';

class FunctionPanel extends Component {

  static propTypes = {
    className: PropTypes.string,
    func: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      latex: PropTypes.string,
      func: PropTypes.string
    })
  };

  static defaultProps = {
    className: '',
    func: null
  };

  static contextType = FunctionWorkerContext;

  constructor(props) {
    super(props);

    this.state = {
      pointsData: { z: [] },
      calculating: false
    };

  }

  componentDidMount() {
    this.context.onmessage = (event) => {
      switch (event.data.type) {
        case 'CALCULATE_3D_RESULT':
          this.setState({ calculating: false });
          this.setState({ pointsData: event.data.payload });
      }
    };

    this.updateGraph();
  }

  updateGraph = () => {
    if (this.props.func) {
      this.setState({ calculating: true })
      this.context.postMessage({
        type: 'CALCULATE_3D',
        payload: {
          func: this.props.func.func,
          min: -20,
          max: 20,
          step: 0.5
        }
      });
    }
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevProps.func || (this.props.func && this.props.func.func !== prevProps.func.func)) {
      this.updateGraph();
    }
  }

  render() {
    return (
      <div className={`FunctionPanel ${this.props.className}`}>
        <Card style={{ width: 'fit-content' }}>
          <H4>Функция</H4>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'start' }}>
              <div style={{ width: 700, height: 500, border: '1px solid #e9e9e9', overflow: 'hidden' }}>
                { this.state.calculating && <div className="easy-flex"><Spinner size={40} /></div> }
                <Plot
                  data={[
                    {
                      ...this.state.pointsData,
                      type: 'surface'
                    }
                  ]}
                  layout={{
                    autosize: true,
                    width: 700,
                    height: 500,
                    margin: {
                      l: 10,
                      r: 10,
                      b: 10,
                      t: 10,
                    }
                  }}
                />
              </div>
              <div style={{ width: 500, marginLeft: 15 }}>
                <span>{this.props.func?.name || 'Функция не выбрана'}</span>
                <br />
                <br />
                { this.props.func?.latex && (
                  Array.isArray(this.props.func.latex)
                  ? this.props.func.latex.map(l => <><Latex>{l}</Latex><br/></>)
                  : <Latex>{this.props.func.latex}</Latex>)
                }
              </div>
            </div>
        </Card>
      </div>
    );
  }
}

FunctionPanel.propTypes = {};

export default FunctionPanel;
