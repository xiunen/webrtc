import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import { connect } from "react-redux";

import Login from "./components/Login";
import Main from "./components/Main";
import Message from "./components/Log";
import socket from './models/socket'
import store from './redux/store'
import * as actionTypes from './redux/actionTypes'

import style from './style.less';

class App extends PureComponent {
  static propTypes = {
    currentUser: PropTypes.object,
    selectedUser: PropTypes.object,
  }

  componentDidMount() {
    this.rtcConnection = new RTCPeerConnection()
    socket.setHandle(this.handleSocket)
  }

  handleSocket = (res = {}) => {
    if (res.action === 'login') {
      if (res.success) {
        const { id, id: name } = res.user
        store.dispatch({ type: actionTypes.LOGIN, payload: { name, id } })
        socket.setSender({ id, name })
        sessionStorage.setItem('user', id)
      }
    } else if (res.action === 'friends') {
      const { selectedUser } = this.props
      store.dispatch({ type: actionTypes.SET_FRIENDS, payload: res.data })
      if (!res.data.find(item => item.id === selectedUser.id)) {
        store.dispatch({ type: actionTypes.SELECT_USER, payload: null })
      }
    } else if (res.action === 'answer') {
      if (res.success) {
        const { connections } = store.getState();
        const { user, desc } = res
        const connection = connections[user.id]
        connection.rtc.accept(desc)
      }
    } else if (res.action === 'callout') {
      store.dispatch({
        type: actionTypes.RTC_CALL,
        payload: {
          user: res.user,
          desc: res.desc
        }
      })
    } else if (res.action === 'candidate') {
      if (res.success) {
        const { connections } = store.getState();
        const { user, desc } = res
        const connection = connections[user.id]
        if (connection.rtc) {
          connection.rtc.addCandidate(desc)
        } else {
          store.dispatch({
            type: actionTypes.RTC_CANDIDATE,
            payload: { candidate: desc, user }
          })
        }
      }
    }
  }

  render() {
    const { currentUser } = this.props;
    return (
      <div className={style.container}>
        <div className={style.content}>
          {currentUser ?
            <Main /> :
            <Login />
          }
        </div>
        <Message />
      </div>
    );
  }
}

export default connect(state => ({
  currentUser: state.currentUser,
  selectedUser: state.selectedUser
}))(cssModules(App, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' }));
