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
    className: PropTypes.string
  };

  static defaultProps = {
    className: ''
  };

  constructor(props) {
    super(props);

    this.state = {
      kernel: '',
      selectionExp: 8,
      shrinkRate: 1,
      shrinkExp: 2,
      trialPointsCount: 50
    };
  }

  handleSelectKernel = (kernel) => {
    this
  }

  kernelSelectMenu = (
    <Menu>
      <Menu.Divider title="Ядра" />
      <Menu.Item text={<Latex>{'$exp(-sg)$ - экспоненциальное'}</Latex>} />
      <Menu.Item text={<Latex>{'$(1-g)^s$ - линейное'}</Latex>} />
      <Menu.Item text={<Latex>{'$(1-g^2)^s$ - параболическое'}</Latex>} />
      <Menu.Item text={<Latex>{'$(1-g^3)^s$ - кубическое'}</Latex>} />
    </Menu>
  );

  render() {
    return (
      <div className={`AlgorithmSettings ${this.props.className}`}>
        <Card>
          <H4>Метод селективного усреднения координат</H4>
          <FormGroup
            label="Ядро"
            fill
          >
            <Popover content={this.kernelSelectMenu} position={Position.BOTTOM} fill>
              <Button alignText={Alignment.LEFT} rightIcon="caret-down" fill>Выбрать</Button>
            </Popover>
          </FormGroup>
          <FormGroup
            label={<Latex>{'Степень селективности $\\mathit{s}$'}</Latex>}
          >
            <InputGroup placeholder="8" />
          </FormGroup>
          <FormGroup
            label={<Latex>{'Коэффициент сжатия $\\mathit{\\gamma_q}$'}</Latex>}
          >
            <InputGroup placeholder="0.8 ≤ y ≤ 1.2" />
          </FormGroup>
          <FormGroup
            label={<Latex>{'Степень сжатия $\\mathit{q}$'}</Latex>}
          >
            <InputGroup placeholder="2" />
          </FormGroup>
          <FormGroup
            label={<Latex>{'Количество пробных точек $\\mathit{n}$'}</Latex>}
          >
            <InputGroup placeholder="50" />
          </FormGroup>
        </Card>
      </div>
    );
  }
}
