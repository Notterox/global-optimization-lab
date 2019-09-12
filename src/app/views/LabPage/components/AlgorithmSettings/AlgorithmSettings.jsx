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
    className: PropTypes.string,
    settings: PropTypes.shape({
      targetFunction: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        latex: PropTypes.string,
        func: PropTypes.string
      }),
      xmin: PropTypes.number,
      xmax: PropTypes.number,
      ymin: PropTypes.number,
      ymax: PropTypes.number
    }),
    onChange: PropTypes.func
  };

  static defaultProps = {
    className: '',
    settings: {
      targetFunction: {},
      xmin: -10,
      xmax: 10,
      ymin: -10,
      ymax: 10
    },
    onChange: null
  };

  updateState = (state) => {
    if (this.props.onChange) {
      this.props.onChange({ ...this.props, ...state });
    }
  };

  handleValueChange = (field, val) => this.updateState({ [field]: val });

  handleSelectFn = fnId => () => this.updateState({ targetFunction: this.functionDescription[fnId] });

  // eslint-disable-next-line react/sort-comp
  functionDescription = {
    test: {
      id: 'test',
      name: 'Тест',
      latex: '$f(x, y) = 6(x+5)^2+7(y-3)^2$',
      func: '(x, y) => 6 * Math.pow(x + 5, 2) + 7 * Math.pow(y - 3, 2)'
    },
    example2: {
      name: 'Пример 2',
      latex: ''
    },
    example3: {
      name: 'Пример 3',
      latex: ''
    }
  };

  functionSelectMenu = (
    <Menu>
      <Menu.Item icon="edit" text="Задать..." />
      <Menu.Divider title="Примеры" />
      <Menu.Item text="Тест" onClick={this.handleSelectFn('test')} />
      <Menu.Item text="Пример 1" onClick={this.handleSelectFn('example1')} />
      <Menu.Item text="Пример 2" onClick={this.handleSelectFn('example2')} />
      <Menu.Item text="Пример 3" onClick={this.handleSelectFn('example3')} />
      <Menu.Divider title="Тестовые функции" />
      <Menu.Item text="Функция Растригина" onClick={this.handleSelectFn('rastrigin')} />
      <Menu.Item text="Функция Розенброка" onClick={this.handleSelectFn('rosenbrock')} />
      <Menu.Item text="Функция Изома" onClick={this.handleSelectFn('easom')} />
    </Menu>
  );

  render() {
    const { settings } = this.props;

    return (
      <div className={`AlgorithmSettings ${this.props.className}`}>
        <Card>
          <H4>Настройка задачи оптимизации</H4>
          <FormGroup
            label="Функция"
          >
            <Popover content={this.functionSelectMenu} position={Position.BOTTOM} fill>
              <Button alignText={Alignment.LEFT} rightIcon="caret-down" fill>
                { this.functionDescription[settings.targetFunction.id]
                  ? settings.targetFunction.name
                  : 'Выбрать'
                }
              </Button>
            </Popover>
          </FormGroup>
          <FormGroup
            label="X"
            labelFor="x-input"
          >
            <ControlGroup fill>
              <InputGroup
                placeholder="Xmin"
                value={settings.xmin}
                onChange={e => this.handleValueChange('xmin', e.target.value)}
              />
              <InputGroup
                placeholder="Xmax"
                value={settings.xmax}
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
                value={settings.ymin}
                onChange={e => this.handleValueChange('ymin', e.target.value)}
              />
              <InputGroup
                placeholder="Ymax"
                value={settings.ymax}
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
