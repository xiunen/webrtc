import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';
import { connect } from "react-redux";

import Login from "./components/Login";
import Main from "./components/Main";
import Panel from "./components/Panel";
import Message from "./components/Message";
import socket from './actions/socket'
import store from './redux/store'
import * as actionTypes from './redux/actionTypes'

import style from './style.css';

class App extends PureComponent {
  static propTypes = {
    name: PropTypes.string,
  }

  state = {
    friends: ["bob", 'alice'],
    messages: [],
  }


  componentDidMount() {
    this.rtcConnection = new RTCPeerConnection()
    socket.setHandle(this.addMsg)
    socket.setMsgHandle(this.handleSocket)
  }

  addMsg = (msg) => {
    if (!msg) return;
    store.dispatch({
      type: actionTypes.ADD_MESSAGE,
      payload: msg
    })
  }

  handleSocket = (res = {}) => {
    if (res.action === 'login') {
      if (res.success) {
        store.dispatch({ type: actionTypes.LOGIN, payload: res.name })
        socket.setSender(res.name)
      }
    } else if (res.action === 'friends') {
      store.dispatch({ type: actionTypes.SET_FRIENDS, payload: res.data })
    }
  }

  render() {
    const { friends } = this.state
    const { name } = this.props;
    return (
      <div className={style.container}>
        <div className={style.content}>
          {name ?
            <Main currentUser={name} friends={friends} /> :
            <Login />
          }
        </div>
        <Message />
      </div>
    );
  }
}

export default connect(state => ({ name: state.name }))(cssModules(App, style, { allowMultiple: true, handleNotFoundStyleName: 'ignore' }));
