import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, H4, NumericInput } from '@blueprintjs/core';

class CyclicRunSettings extends Component {
  static propTypes = {
    settings: PropTypes.shape({
      amount: PropTypes.number
    }),
    onInit: PropTypes.func,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    settings: {
      amount: 1000
    },
    onInit: null,
    onChange: null
  };

  componentDidMount() {
    this.props.onInit?.(this.props.settings);
  }

  render() {
    return (
      <Card>
        <H4>Количество циклов</H4>
        <NumericInput
          small
          fill
          placeholder="Количество повторов"
          value={this.props.settings.amount}
          onValueChange={v => this.props.onChange?.({ amount: v })}
        />
      </Card>
    );
  }
}

export default CyclicRunSettings;
