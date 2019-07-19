import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import { connect } from 'react-redux'
import { RTC_STATUS } from '../../constants'
import RTC from '../../models/rtc'

import style from './style.less';


class Main extends PureComponent {
  static propTypes = {
    currentUser: PropTypes.string,
    connection: PropTypes.object,
    friends: PropTypes.arrayOf(PropTypes.string)
  }

  state = {
    selectedUser: null,
    connecting: null,
  }

  callout = () => {
    const { connection, selectedUser } = this.props;
    if (connection && connection.rtc) {
      connection.callout(selectedUser)
    } else {
      const conn = new RTC()
      conn.callout(selectedUser)
    }
  }

  answer = () => {
    const { connection, selectedUser } = this.props;
    const { rtc } = connection
    if (rtc) {
      rtc.answer(selectedUser)
    } else {
      const conn = new RTC()
      conn.answer(selectedUser)
    }
  }

  //connect
  renderCall() {
    return (
      <button className='primary' onClick={this.callout}>Connect </button>
    )
  }

  renderConnecting() {
    return (
      <div>
        Connecting...
        </div>
    )
  }

  //accept
  renderAccept() {
    const { selectedUser } = this.props
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          {selectedUser.name} is calling you!
           </div>
        <button className='primary' onClick={this.answer}> Accept </button>
      </div>
    )
  }

  //connected
  renderConnected() { }

  renderContent() {
    const { connection } = this.props;
    if (!connection) return this.renderCall()
    if (connection.status === RTC_STATUS.connecting) return this.renderConnecting()
    if (connection.status === RTC_STATUS.call) return this.renderAccept()
    return null;
  }

  render() {
    return (
      <div className={style.container}>
        {this.renderContent()}
      </div>
    )
  }
}

export default connect(state => {
  const { selectedUser, connections = {} } = state
  return {
    selectedUser: selectedUser,
    connection: selectedUser ? connections[selectedUser.id] : null,
  }
})(cssModules(Main, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' }));
