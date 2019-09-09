import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Classes,
  ControlGroup,
  FormGroup,
  H4,
  InputGroup,
  NumericInput,
  Button
} from '@blueprintjs/core';

import './AlgorithmSettings.scss';

export default class AlgorithmSettings extends Component {
  static propTypes = {
    className: PropTypes.string
  };

  static defaultProps = {
    className: ''
  };

  render() {
    return (
      <div className={`AlgorithmSettings ${this.props.className}`}>
        <Card>
          <H4>Настройка задачи оптимизации</H4>
          <FormGroup
            label="Функция"
            labelFor="func-input"
          >
            <InputGroup id="func-input" placeholder="x*x + y*y" large/>
          </FormGroup>
          <FormGroup
            label="X"
            labelFor="x-input"
          >
            <ControlGroup fill>
              <InputGroup placeholder="Xmin"/>
              <InputGroup placeholder="Xmax"/>
            </ControlGroup>
          </FormGroup>
          <FormGroup
            label="Y"
            labelFor="y-input"
          >
            <ControlGroup fill>
              <InputGroup placeholder="Ymin"/>
              <InputGroup placeholder="Ymax"/>
            </ControlGroup>
          </FormGroup>
          <Button>Запустить</Button>
        </Card>
      </div>
    );
  }
}
