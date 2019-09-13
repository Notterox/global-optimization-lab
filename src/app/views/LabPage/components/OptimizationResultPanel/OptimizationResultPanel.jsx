import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, H4 } from '@blueprintjs/core';

import './OptimizationResultPanel.scss';

export default class OptimizationResultPanel extends Component {
  static propTypes = {
    className: PropTypes.string
  };

  static defaultProps = {
    className: ''
  };

  render() {
    return (
      <div>
        <Card>
          <H4>Результат оптимизации</H4>
        </Card>
      </div>
    );
  }
}
