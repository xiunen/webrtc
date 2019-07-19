import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import { connect } from 'react-redux'
import store from '../../redux/store'
import socket from "../../models/socket";
import * as actionTypes from '../../redux/actionTypes'
import { RTC_STATUS } from '../../constants/index'

import style from './style.less';

class Sidebar extends PureComponent {
  static propTypes = {
    currentUser: PropTypes.object,
    friends: PropTypes.arrayOf(PropTypes.object),
    connections: PropTypes.object
  }

  selectUser = (user) => {
    store.dispatch({
      type: actionTypes.SELECT_USER,
      payload: user
    })
  }

  logout = () => {
    sessionStorage.removeItem('user')
    socket.logout()
    store.dispatch({ type: actionTypes.LOGOUT })
  }

  renderStatus(user) {
    const { connections } = this.props;
    const connection = connections[user.id]
    if (!connection) return null
    if (RTC_STATUS.connected === connection.status) {
      return <span className={style.done} />
    }
    if (RTC_STATUS.call === connection.status) {
      return <span className={style.doing} />
    }
    return null;
  }


  render() {
    const { currentUser, friends: friendsIncludeMe = [], selectedUser } = this.props;
    const friends = friendsIncludeMe.filter(user => user.id !== currentUser.id)

    return (
      <section className={style.userlist}>
        <header>{currentUser.name}</header>
        <div className={style.friendscontainer}>
          <ul className={style.friends}>
            {
              friends.map(user => (
                <li onClick={() => this.selectUser(user)}
                  key={user.id} className={selectedUser === user ? style.active : ''}>
                  <span>{user.name}</span>
                  {this.renderStatus(user)}
                </li>
              ))
            }
          </ul>
        </div>
        <footer onClick={this.logout}> 退出</footer>
      </section>
    );
  }
}

export default connect(state => ({
  currentUser: state.currentUser,
  selectedUser: state.selectedUser,
  friends: state.friends,
  connections: state.connections
}))(cssModules(Sidebar, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' }));
