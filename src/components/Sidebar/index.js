import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import { connect } from 'react-redux'
import store from '../../redux/store'
import socket from "../../actions/socket";
import * as actionTypes from '../../redux/actionTypes'

import style from './style.less';

class Sidebar extends PureComponent {
  static propTypes = {
    currentUser: PropTypes.string,
    friends: PropTypes.arrayOf(PropTypes.string),
    // callings: [],
  }

  selectUser = (user) => {
    store.dispatch({
      type: actionTypes.SELECT_USER,
      payload: user
    })
  }

  logout = () => {
    socket.logout()
    store.dispatch({ type: actionTypes.LOGOUT })
  }

  renderStatus(user) {
    return null;
    // const { callings, connecting } = this.props;

  }


  render() {
    const { currentUser, friends: friendsIncludeMe = [], selectedUser } = this.props;
    const friends = friendsIncludeMe.filter(user => user !== currentUser)

    return (
      <section className={style.userlist}>
        <header>{currentUser}</header>
        <div className={style.friendscontainer}>
          <ul className={style.friends}>
            {
              friends.map(user => (
                <li onClick={() => this.selectUser(user)}
                  key={user} className={selectedUser === user ? style.active : ''}>
                  <span>{user}</span>
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
  currentUser: state.name,
  selectedUser: state.selectedUser,
  friends: state.friends,
  connection: state.connection
}))(cssModules(Sidebar, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' }));
