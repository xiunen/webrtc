import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';

import Panel from '../Panel'
import socket from '../../actions/socket'

import style from './style.less';

class Login extends PureComponent {
  static propTypes = {
  }

  state = {
    name: ''
  }

  handleClick = () => {
    const {name} = this.state
    socket.login(name)
  }

  render() {
    const { name } = this.state

    return (
      <Panel className={style.container}>
        <header className={style.header}>登录</header>
        <div className={style.content}>
          <div>
            <input value={name} className={style.input} placeholder='用户名'
              onChange={e => this.setState({ name: e.target.value })}
            />
          </div>
          <div className={style.action}>
            <button disabled={!name} onClick={this.handleClick}>登录</button>
          </div>
        </div>
      </Panel>
    );
  }
}

export default cssModules(Login, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' });
