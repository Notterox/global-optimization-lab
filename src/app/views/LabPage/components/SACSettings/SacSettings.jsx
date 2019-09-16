import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ButtonGroup,
  Card, ControlGroup,
  FormGroup,
  H4, InputGroup,
  Popover,
  Menu,
  Position, Alignment
} from '@blueprintjs/core';
import Latex from 'react-latex';

import './SacSettings.scss';

export default class SacSettings extends Component {
  static propTypes = {
    className: PropTypes.string,
    settings: PropTypes.shape({
      kernel: PropTypes.string,
      selectionRate: PropTypes.number,
      shrinkMult: PropTypes.number,
      shrinkRate: PropTypes.number,
      trialsAmount: PropTypes.number
    }),
    onChange: PropTypes.func
  };

  static defaultProps = {
    className: '',
    settings: {
      kernel: '',
      selectionRate: 8,
      shrinkMult: 1,
      shrinkRate: 2,
      trialsAmount: 50
    },
    onChange: () => {}
  };

  kernelsList = {
    exponential: {
      id: 'exponential',
      latex: '$exp(-sg)$ - экспоненциальное'
    },
    linear: {
      id: 'linear',
      latex: '$(1-g)^s$ - линейное'
    },
    parabolic: {
      id: 'parabolic',
      latex: '$(1-g^2)^s$ - параболическое'
    },
    cubic: {
      id: 'cubic',
      latex: '$(1-g^3)^s$ - кубическое'
    }
  };

  updateSettings = (setting) => {
    this.props.onChange({ ...this.props.settings, ...setting });
  };

  handleSelectKernel = (kernel) => () => {
    this.updateSettings({ kernel });
  };

  kernelSelectMenu = (
    <Menu>
      <Menu.Divider title="Ядра" />
      <Menu.Item onClick={this.handleSelectKernel('exponential')} text={<Latex>$exp(-sg)$ - экспоненциальное</Latex>} />
      <Menu.Item onClick={this.handleSelectKernel('linear')} text={<Latex>$(1-g)^s$ - линейное</Latex>} />
      <Menu.Item onClick={this.handleSelectKernel('parabolic')} text={<Latex>$(1-g^2)^s$ - параболическое</Latex>} />
      <Menu.Item onClick={this.handleSelectKernel('cubic')} text={<Latex>$(1-g^3)^s$ - кубическое</Latex>} />
    </Menu>
  );

  render() {
    const { kernel, selectionRate, shrinkMult, shrinkRate, trialsAmount } = this.props.settings;

    return (
      <div className={`AlgorithmSettings ${this.props.className}`}>
        <Card>
          <H4>Метод селективного усреднения координат</H4>
          <FormGroup
            label="Ядро"
            fill
          >
            <Popover content={this.kernelSelectMenu} position={Position.BOTTOM} fill>
              <Button small alignText={Alignment.LEFT} rightIcon="caret-down" fill>
                { kernel
                  ? <Latex>{ this.kernelsList[kernel].latex }</Latex>
                  : 'Выбрать'
                }
              </Button>
            </Popover>
          </FormGroup>
          <FormGroup
            label={<Latex>{'Степень селективности $\\mathit{s}$'}</Latex>}
          >
            <InputGroup small placeholder="8" value={selectionRate} onChange={e => this.updateSettings({ selectionRate: e.target.value })} />
          </FormGroup>
          <FormGroup
            label={<Latex>{'Коэффициент сжатия $\\mathit{\\gamma_q}$'}</Latex>}
          >
            <InputGroup small placeholder="0.8 ≤ y ≤ 1.2" value={shrinkMult} onChange={e => this.updateSettings({ shrinkMult: e.target.value })} />
          </FormGroup>
          <FormGroup
            label={<Latex>{'Степень сжатия $\\mathit{q}$'}</Latex>}
          >
            <InputGroup small placeholder="2" value={shrinkRate} onChange={e => this.updateSettings({ shrinkRate: e.target.value })} />
          </FormGroup>
          <FormGroup
            label={<Latex>{'Количество пробных точек $\\mathit{n}$'}</Latex>}
          >
            <InputGroup small placeholder="50" value={trialsAmount} onChange={e => this.updateSettings({ trialsAmount: e.target.value })} />
          </FormGroup>
        </Card>
      </div>
    );
  }
}
