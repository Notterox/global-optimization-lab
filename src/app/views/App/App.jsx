import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Navbar, Button, Alignment } from '@blueprintjs/core';

import LabPage from '../LabPage/LabPage';
import CyclicRunPage from '../CycleRunPage';

export default class App extends Component {
  static propTypes = {
    className: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      currentScreen: 'lab'
    };
  }

  switch = page => () => this.setState({ currentScreen: page });
  isActive = page => this.state.currentScreen === page;

  render() {
    return (
      <div style={{ maxWidth: '100%', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch' }}>
        <Navbar>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>Метод селективного усреднения координат</Navbar.Heading>
            <Navbar.Divider />
            <Button className="bp3-minimal" icon="diagram-tree" text="Алгоритм" active={this.isActive('lab')} onClick={this.switch('lab')} />
            <Button className="bp3-minimal" icon="repeat" text="Цикличный запуск" active={this.isActive('cycle')} onClick={this.switch('cycle')} />
            <Button className="bp3-minimal" icon="timeline-line-chart" text="Исследование параметров" active={this.isActive('experiment')} onClick={this.switch('experiment')} />
          </Navbar.Group>
        </Navbar>
        <div style={{ height: '100%' }}>
          {
            this.state.currentScreen === 'lab'
            && <LabPage />
          }
          {
            this.state.currentScreen === 'cycle'
            && <CyclicRunPage/>
          }
        </div>
      </div>
    );
  }
}
