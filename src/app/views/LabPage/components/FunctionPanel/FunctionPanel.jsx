import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, H4, Spinner } from '@blueprintjs/core';
import Plot from 'react-plotly.js';
import Latex from 'react-latex';

class FunctionPanel extends Component {
  static propTypes = {
    className: PropTypes.string,
    func: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      latex: PropTypes.string,
      func: PropTypes.string,
      min: PropTypes.number,
      max: PropTypes.number,
      step: PropTypes.number
    }),
    calculating: PropTypes.bool,
    functionValues: PropTypes.shape({
      x: PropTypes.arrayOf(PropTypes.number),
      y: PropTypes.arrayOf(PropTypes.number),
      z: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))
    })
  };

  static defaultProps = {
    className: '',
    func: null,
    calculating: false,
    functionValues: { z: [[0]] }
  };

  render() {
    return (
      <div className={`FunctionPanel ${this.props.className}`}>
        <Card style={{ width: 'fit-content' }}>
          <H4>Функция</H4>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'start' }}>
            <div style={{ width: 700, height: 500, border: '1px solid #e9e9e9', overflow: 'hidden' }}>
              { this.props.calculating && <div className="easy-flex"><Spinner size={40} /></div> }
              <Plot
                data={[
                  {
                    ...(this.props.functionValues?.z ? this.props.functionValues : { z: [[0]] }),
                    type: 'surface',
                    colorbar: {
                      thickness: 10
                    },
                    colorscale: 'Electric'
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
                  },
                  scene: {
                    aspectmode: 'cube'
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
                    ? this.props.func.latex.map(l => (
                      <>
                        <Latex>{l}</Latex>
                        <br />
                      </>
                    ))
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
