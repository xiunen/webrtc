import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';

import Panel from '../Panel'
import socket from '../../models/socket'

import style from './style.less';

class Login extends PureComponent {
  static propTypes = {
  }

  state = {
    name: ''
  }

  componentDidMount() {
    const user = sessionStorage.getItem('user')
    if (user) {
      socket.login(user)
    }
  }

  handleClick = () => {
    const { name } = this.state
    socket.login(name)
  }

  render() {
    const { name } = this.state

    return (
      <Panel className={style.container}>
        <header className={style.header}>Sign In</header>
        <div className={style.content}>
          <div>
            <input value={name} className={style.input} placeholder='Username'
              onChange={e => this.setState({ name: e.target.value })}
            />
          </div>
          <div className={style.action}>
            <button className='primary' disabled={!name} onClick={this.handleClick}>Sign In</button>
          </div>
        </div>
      </Panel>
    );
  }
}

export default cssModules(Login, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' });
