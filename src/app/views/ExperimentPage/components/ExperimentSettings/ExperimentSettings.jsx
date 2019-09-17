import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  H4,
  RadioGroup,
  Radio,
  FormGroup, ControlGroup, InputGroup
} from '@blueprintjs/core';
import Latex from 'react-latex';

class ExperimentSettings extends Component {
  static propTypes = {
    settings: PropTypes.shape({
      parameter: PropTypes.oneOf(['selectionRate', 'shrinkRate', 'shrinkMult', 'trialsAmount']),
      start: PropTypes.number,
      end: PropTypes.number,
      step: PropTypes.number
    }),
    onInit: PropTypes.func,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    settings: {
      parameter: 'selectionRate',
      start: 0,
      end: 100,
      step: 1
    },
    onInit: null,
    onChange: null
  };

  componentDidMount() {
    this.props.onInit?.(this.props.settings);
  }

  updateSettings = (setting) => {
    this.props.onChange({ ...this.props.settings, ...setting });
  };

  render() {
    return (
      <Card>
        <H4>Выбор параметра</H4>
        <RadioGroup
          label="Параметр для исследования"
          selectedValue={this.props.settings.parameter}
          onChange={e => this.updateSettings({ parameter: e.target.value })}
        >
          <Radio label={<Latex>{'Степень селективности $\\mathit{s}$'}</Latex>} value="selectionRate" />
          <Radio label={<Latex>{'Коэффициент сжатия $\\mathit{\\gamma_q}$'}</Latex>} value="shrinkMult" />
          <Radio label={<Latex>{'Степень сжатия $\\mathit{q}$'}</Latex>} value="shrinkRate" />
          <Radio label={<Latex>{'Количество пробных точек $\\mathit{n}$'}</Latex>} value="trialsAmount" />
        </RadioGroup>
        <FormGroup
          label="Диапазон значений"
          labelFor="x-input"
        >
          <ControlGroup fill>
            <InputGroup
              placeholder="с"
              small
              value={this.props.settings.start}
              onChange={e => this.updateSettings({ start: e.target.value })}
            />
            <InputGroup
              placeholder="по"
              small
              value={this.props.settings.end}
              onChange={e => this.updateSettings({ end: e.target.value })}
            />
          </ControlGroup>
        </FormGroup>
        <FormGroup
          label="Шаг"
        >
          <InputGroup
            fill
            small
            placeholder="1"
            value={this.props.settings.step}
            onChange={e => this.updateSettings({ step: e.target.value })}
          />
        </FormGroup>
      </Card>
    );
  }
}

export default ExperimentSettings;
