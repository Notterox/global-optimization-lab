import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Navbar, Button, Alignment } from '@blueprintjs/core';

import LabPage from '../LabPage/LabPage';

export default class App extends Component {
  static propTypes = {
    prop: PropTypes
  }

  constructor(props) {
    super(props);

    this.state = {
      currentScreen: 'lab'
    }
  }

  render() {
    return (
      <div style={{ maxWidth: '100%', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch' }}>
        <Navbar>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>Blueprint</Navbar.Heading>
            <Navbar.Divider />
            <Button className="bp3-minimal" icon="home" text="Home" />
            <Button className="bp3-minimal" icon="document" text="Files" />
          </Navbar.Group>
        </Navbar>
        <div style={{ height: '100%' }}>
          {
            this.state.currentScreen === 'lab' &&
            <LabPage />
          }
        </div>
      </div>
    )
  }
}
