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
  ButtonGroup,
  Popover,
  Button,
  Menu,
  Position, Alignment
} from '@blueprintjs/core';
import Latex from 'react-latex';

import './AlgorithmSettings.scss';

export default class AlgorithmSettings extends Component {
  static propTypes = {
    className: PropTypes.string
  };

  static defaultProps = {
    className: ''
  };

  constructor(props) {
    super(props);

    this.state = {
      targetFunction: '',
      xmin: '',
      xmax: '',
      ymin: '',
      ymax: ''
    };
  }


  handleValueChange = (field, val) => this.setState({ [field]: val });

  handleSelectFn = fnId => () => this.setState({ targetFunction: fnId });

  // eslint-disable-next-line react/sort-comp
  functionDescription = {
    example1: {
      title: 'Пример 1',
      latex: '$f(x, y) = 6(x+5)^2+7(y-3)^2$'
    },
    example2: {
      title: 'Пример 2',
      latex: ''
    },
    example3: {
      title: 'Пример 3',
      latex: ''
    }
  };

  functionSelectMenu = (
    <Menu>
      <Menu.Item icon="edit" text="Задать..." />
      <Menu.Divider title="Примеры" />
      <Menu.Item text="Пример 1" onClick={this.handleSelectFn('example1')} />
      <Menu.Item text="Пример 2" onClick={this.handleSelectFn('example2')} />
      <Menu.Item text="Пример 3" onClick={this.handleSelectFn('example3')} />
      <Menu.Divider title="Тестовые функции" />
      <Menu.Item text="Функция Растригина" onClick={this.handleSelectFn('rastrigin')} />
      <Menu.Item text="Функция Розенброка" onClick={this.handleSelectFn('rosenbrock')} />
      <Menu.Item text="Функция Изома" onClick={this.handleSelectFn('izom')} />
    </Menu>
  );

  render() {
    return (
      <div className={`AlgorithmSettings ${this.props.className}`}>
        <Card>
          <H4>Настройка задачи оптимизации</H4>
          <FormGroup
            label="Функция"
          >
            <Popover content={this.functionSelectMenu} position={Position.BOTTOM} fill>
              <Button alignText={Alignment.LEFT} rightIcon="caret-down" fill>
                { this.functionDescription[this.state.targetFunction]
                  ? this.functionDescription[this.state.targetFunction].title
                  : 'Выбрать'
                }
              </Button>
            </Popover>
          </FormGroup>
          <FormGroup>
            { this.functionDescription[this.state.targetFunction]
                && <Latex>{this.functionDescription[this.state.targetFunction].latex}</Latex>
            }
          </FormGroup>
          <FormGroup
            label="X"
            labelFor="x-input"
          >
            <ControlGroup fill>
              <InputGroup
                placeholder="Xmin"
                value={this.state.xmin}
                onChange={e => this.handleValueChange('xmin', e.target.value)}
              />
              <InputGroup
                placeholder="Xmax"
                value={this.state.xmax}
                onChange={e => this.handleValueChange('xmax', e.target.value)}
              />
            </ControlGroup>
          </FormGroup>
          <FormGroup
            label="Y"
            labelFor="y-input"
          >
            <ControlGroup fill>
              <InputGroup
                placeholder="Ymin"
                value={this.state.ymin}
                onChange={e => this.handleValueChange('ymin', e.target.value)}
              />
              <InputGroup
                placeholder="Ymax"
                value={this.state.ymax}
                onChange={e => this.handleValueChange('ymax', e.target.value)}
              />
            </ControlGroup>
          </FormGroup>
          <Button>Запустить</Button>
        </Card>
      </div>
    );
  }
}
