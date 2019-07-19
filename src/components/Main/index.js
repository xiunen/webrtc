import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import { connect } from 'react-redux'
import { RTC_STATUS } from '../../constants'
import RTC from '../../models/rtc'

import Sidebar from '../Sidebar'
import ConnectionStatus from '../ConnectionStatus'
import InputArea from '../InputArea'
import Toolbar from '../Toolbar'
import Message from '../Message'

import style from './style.less';


class Main extends PureComponent {
  static propTypes = {
    currentUser: PropTypes.string,
    connection: PropTypes.object,
    friends: PropTypes.arrayOf(PropTypes.string)
  }

  render() {
    const { selectedUser, connection } = this.props;

    return (
      <div className={style.container}>
        <Sidebar />
        {selectedUser ? <section className={style.body}>
          <header className={style.header}>{selectedUser.name}</header>
          {(connection && connection.status === RTC_STATUS.connected) ? (
            <div>
              <Message />
              <Toolbar />
              <InputArea />
            </div>
          ) : (
              <ConnectionStatus />
            )}
        </section> : <section className={style['no-body']}>未选择连接对象</section>}
      </div>
    );
  }
}

export default connect(state => {
  const { selectedUser, connections = {} } = state
  return {
    selectedUser: selectedUser,
    connection: selectedUser ? connections[selectedUser.id] : null,
  }
})(cssModules(Main, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' }));
